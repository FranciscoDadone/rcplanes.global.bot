import path from 'path';
import fs from 'fs';
import {
  getGeneralConfig,
  getQueue,
  removePostFromQueue,
  getUtil,
  setUtil,
  addPostToHistory,
} from '../database/DatabaseQueries';
import { publish } from '../services/instagramAPI.service';

async function uploadNewPost() {
  const mediaQueue = await getQueue();
  if (mediaQueue[0] === undefined) {
    console.log(
      'Cant upload to instagram because there is nothing on the queue :('
    );
    return;
  }
  const post = mediaQueue[0];

  const igLink = await publish(
    post.media,
    post.mediaType,
    post.caption,
    post.owner
  );
  if (igLink === undefined) {
    console.log('============= POSTING FAILED, RETRYING =============');
    uploadNewPost();
    return;
  }
  addPostToHistory(
    igLink,
    post.media,
    post.mediaType,
    post.owner,
    post.caption,
    new Date().toString()
  );

  removePostFromQueue(post.id);

  const pathToDelete = path.join(
    __dirname,
    post.mediaType === 'IMAGE'
      ? '../../storage/temp.jpg'
      : `../../${post.media}`
  );
  try {
    fs.unlinkSync(pathToDelete);
  } catch (_err) {
    console.log('Aready deleted! (', pathToDelete, ')');
  }

  const utils = await getUtil();
  await setUtil(
    new Date().toString(),
    utils.totalPostedMedias + 1,
    utils.queuedMedias - 1
  );
}

export async function startPostingTask() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
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
