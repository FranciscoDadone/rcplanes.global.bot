import download from 'download';
import {
  getRecentPosts,
  getTopPosts,
} from '../instagramApi/getPostsFromInstagram';
import {
  savePostFromHashtag,
  getPostFromIdJSON,
  getAllHashtagsToFetch,
  getGeneralConfig,
} from '../database/DatabaseQueries';
import { Post } from '../models/Post';

async function saveMediaToStorage(
  originalUrl: string,
  mediaType: string,
  mediaId: string
) {
  if (
    originalUrl === '' ||
    mediaId === '' ||
    originalUrl === undefined ||
    mediaId === undefined
  )
    return null;
  if (mediaType === 'IMAGE') {
    return download(originalUrl, `./storage`, {
      filename: `${mediaId}.png`,
    }).then(() => `${mediaId}.png`);
  }
  if (mediaType === 'VIDEO') {
    return download(originalUrl, `./storage`, {
      filename: `${mediaId}.mp4`,
    }).then(() => `${mediaId}.mp4`);
  }
  return null;
}

async function savePost(post: Post) {
  const path = await saveMediaToStorage(
    post.getMediaURL(),
    post.getMediaType(),
    post.getPostId()
  );
  if (path !== null) {
    post.setStoragePath(path);
    savePostFromHashtag(post);
  }
}

async function saveAllPosts(posts: Post[]) {
  for (const post of posts) {
    if (post === undefined) {
      console.log('Skipping... there is an undefined post!');
      return;
    }
  }
  console.log('Now saving images or videos...');
  let total = 0;
  for (const post of posts) {
    const postFromDB = await getPostFromIdJSON(post.getPostId());
    if (postFromDB === undefined && post.getMediaURL() !== undefined) {
      await savePost(post);
      total++;
    }
    if (post.getMediaURL() === undefined) {
      console.log(`Skipped (${post.getPermalink()}). Maybe it is a reel.`);
    }
  }
  console.log(`Finished saving images and videos. (Total ${total})`);
}

export async function startHashtagFetching(repeat: boolean) {
  const { hashtagFetchingEnabled } = await getGeneralConfig();
  if (hashtagFetchingEnabled) {
    console.log('Fetching...');
    const hashtags: any = await getAllHashtagsToFetch();
    let allPosts: Post[] = [];
    for (const hashtag of hashtags) {
      global.appStatus = `Fetching #${hashtag.hashtag}`;
      const recentPostsOfHashtag = await getRecentPosts(
        hashtag.hashtag
      ).finally(() => {
        console.log(
          `Finished fetching the recent posts of #${hashtag.hashtag}`
        );
      });
      const topPostsOfHashtag = await getTopPosts(hashtag.hashtag).finally(
        () => {
          console.log(`Finished fetching the top posts of #${hashtag.hashtag}`);
        }
      );
      allPosts = allPosts.concat(recentPostsOfHashtag);
      allPosts = allPosts.concat(topPostsOfHashtag);
    }
    global.appStatus = 'Saving posts';
    await saveAllPosts(allPosts);
    global.appStatus = 'Idling...';
  }

  if (repeat) {
    if (hashtagFetchingEnabled) console.log('Waiting 1 hour to fetch again.');
    await new Promise((resolve) => setTimeout(resolve, 3600000));
    startHashtagFetching(true);
  }
}

module.exports = { startHashtagFetching };
