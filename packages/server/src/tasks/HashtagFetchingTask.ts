import download from 'download';
import {
  getHashtagsGraphQuery,
  getRecentPosts,
  getTopPosts,
} from '../services/instagramAPI.service';
import {
  savePostFromHashtag,
  getPostFromIdJSON,
  getAllHashtagsToFetch,
  getGeneralConfig,
  getCredentials,
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
      console.log(post.getUsername());
      await savePost(post);
      total++;
    }
    if (post.getMediaURL() === undefined) {
      console.log(`Skipped (${post.getPermalink()}).`);
    }
  }
  console.log(`Finished saving images and videos. (Total ${total})`);
}

export async function startHashtagFetching(repeat: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const { hashtagFetchingEnabled } = await getGeneralConfig();
  const { sessionid } = await getCredentials();
  if (hashtagFetchingEnabled && sessionid) {
    console.log('============= START OF HASHTAG FETCH =============');
    const hashtags: any = await getAllHashtagsToFetch();
    let allPosts: Post[] = [];
    for (const hashtag of hashtags) {
      global.appStatus = `Fetching #${hashtag.hashtag}`;
      const graphql = await getHashtagsGraphQuery(hashtag.hashtag);
      const recentPostsOfHashtag = await getRecentPosts(
        hashtag.hashtag,
        graphql
      ).finally(() => {
        console.log(
          `Finished fetching the recent posts of #${hashtag.hashtag}`
        );
      });
      const topPostsOfHashtag = await getTopPosts(
        hashtag.hashtag,
        graphql
      ).finally(() => {
        console.log(`Finished fetching the top posts of #${hashtag.hashtag}`);
      });
      if (recentPostsOfHashtag)
        allPosts = allPosts.concat(recentPostsOfHashtag);
      if (topPostsOfHashtag) allPosts = allPosts.concat(topPostsOfHashtag);
    }

    global.appStatus = 'Saving posts';
    await saveAllPosts(allPosts);
    global.appStatus = 'Idling...';
    console.log('============= END OF HASHTAG FETCH =============');
  }
  if (repeat) {
    if (hashtagFetchingEnabled) console.log('Waiting 1 hour to fetch again.');
    else console.log('Fetching try failed (fetching not enabled)');
    await new Promise((resolve) => setTimeout(resolve, 3600000));
    startHashtagFetching(true);
  }
}

module.exports = { startHashtagFetching };
