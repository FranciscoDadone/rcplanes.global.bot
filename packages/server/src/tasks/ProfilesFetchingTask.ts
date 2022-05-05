import download from 'download';
import {
  savePostFromHashtag,
  getPostFromIdJSON,
  getAllProfilesToFetch,
  getGeneralConfig,
  getCredentials,
  getPostFromPermalinkJSON,
} from '../database/DatabaseQueries';
import { getPostsFromUsername } from '../services/instagramAPI.service';
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
    let postFromDB = await getPostFromIdJSON(post.getPostId());
    if (postFromDB === undefined) {
      const postFromPermalink: any = await getPostFromPermalinkJSON(
        post.getPermalink()
      );
      if (
        postFromPermalink &&
        post.getChildrenOf() !== postFromPermalink[0].childrenOf &&
        post.getChildrenOf() !== ''
      ) {
        // eslint-disable-next-line prefer-destructuring
        postFromDB = postFromPermalink[0];
      }
    }
    if (postFromDB === undefined && post.getMediaURL() !== undefined) {
      await savePost(post);
      total++;
    }
    if (post.getMediaURL() === undefined) {
      console.log(`Skipped (${post.getPermalink()}).`);
    }
  }
  console.log(`Finished saving images and videos. (Total ${total})`);
}

export async function startProfilesFetching(repeat: boolean) {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  const { profilesFetchingEnabled } = await getGeneralConfig();
  const { sessionid, accessToken, fbId } = await getCredentials();
  if (profilesFetchingEnabled && sessionid && accessToken && fbId) {
    console.log('============= START OF PROFILES FETCH =============');
    const profiles: any = await getAllProfilesToFetch();
    let allPosts: Post[] = [];
    for (const profile of profiles) {
      global.appStatus = `Fetching @${profile.username}`;
      const postsFromUsername = await getPostsFromUsername(
        profile.username
      ).finally(() => {
        console.log(`Finished fetching posts of @${profile.username}`);
      });
      if (postsFromUsername) allPosts = allPosts.concat(postsFromUsername);
    }

    global.appStatus = 'Saving posts';
    await saveAllPosts(allPosts);
    global.appStatus = 'Idling...';
    console.log('============= END OF PROFILES FETCH =============');
  }
  if (repeat) {
    if (profilesFetchingEnabled)
      console.log('Waiting 12 hours to fetch again.');
    await new Promise((resolve) => setTimeout(resolve, 3600000 * 12));
    startProfilesFetching(true);
  }
}

module.exports = { startProfilesFetching };
