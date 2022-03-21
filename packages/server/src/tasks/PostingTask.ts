import {
  getGeneralConfig,
  getQueue,
  removePostFromQueue,
  getUtil,
  setUtil,
  addPostToHistory,
} from '../database/DatabaseQueries';
import { uploadToImgur } from '../utils/uploadToImgur';
import { publish } from '../services/postContent.service';

async function uploadNewPost() {
  const mediaQueue = await getQueue();
  if (mediaQueue[0] === undefined) {
    console.log(
      'Cant upload to instagram because there is nothing on the queue :('
    );
    return;
  }
  const post = mediaQueue[0];
  let mediaLink = post.media;

  if (post.mediaType === 'IMAGE') {
    mediaLink = await uploadToImgur(post.media, 'IMAGE');
  }
  await new Promise((resolve) => setTimeout(resolve, 20000));

  let igLink = await publish(mediaLink, post.mediaType, post.caption);
  if (igLink === undefined) igLink = 'unknown';
  addPostToHistory(
    igLink,
    mediaLink,
    post.mediaType,
    post.owner,
    post.caption,
    new Date().toString()
  );

  removePostFromQueue(post.id);

  const utils = await getUtil();
  await setUtil(
    new Date().toString(),
    utils.totalPostedMedias + 1,
    utils.queuedMedias - 1
  );
}

export async function startPostingTask() {
  const { autoPosting } = await getGeneralConfig();
  if (autoPosting) {
    const postingDelay = (await getGeneralConfig()).uploadRate;
    const utils = await getUtil();

    const lastUploadDate = new Date(utils.lastUploadDate);
    const nextPostDate = lastUploadDate;
    nextPostDate.setHours(nextPostDate.getHours() + postingDelay);
    const shouldPost = nextPostDate < new Date();

    if (shouldPost) {
      console.log('============= START OF CONTENT POST =============');
      console.log('Uploading new post to instagram...');
      global.appStatus = 'Uploading new post!';
      await uploadNewPost();
      global.appStatus = 'Idling...';
      console.log('============= END OF CONTENT POST =============');
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 120000));
  startPostingTask();
}

module.exports = {
  startPostingTask,
};
