// /api/posts/<endpoint>

import express from 'express';
import passport from 'passport';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getAllNonDeletedPosts,
  updatePostStatus,
  addPostToQueue,
  getAllPostsJSON,
} from '../../database/DatabaseQueries';
import { imageToBase64 } from '../../utils/imageToBase64';

const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

require('../../authentication/passportConfig')(passport);

// -------------------------- END OF MIDDLEWARES -----------------------------

/**
 * Returns all the posts that have not been deleted, queued or posted.
 * Return: { postId, mediaType, storagePath, caption, permalink, hashtag, status, date, username, childrenOf }
 */
router.get(
  '/non_deleted_fetched_posts',
  authMiddleware,
  async (req: any, res) => {
    const promise = getAllNonDeletedPosts();
    promise.then((data) => {
      res.send(data);
    });
    promise.catch((err) => {
      if (err) res.sendStatus(500);
    });
  }
);

/**
 * Returns all fetched  posts.
 * Return: { postId, mediaType, storagePath, caption, permalink, hashtag, status, date, username, childrenOf }
 */
router.get('/all_fetched_posts', authMiddleware, (req: any, res) => {
  const promise = getAllPostsJSON();
  promise.then((data) => {
    res.send(data);
  });
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
});

/**
 * Receives a post id and deletes that post from the fetched posts.
 * params: { postId }
 */
router.delete('/delete', authMiddleware, (req: any, res) => {
  const mediaFile =
    req.query.postId + (req.query.mediaType === 'IMAGE' ? '.png' : '.mp4');
  const pathToDelete = path.join(__dirname, `../../../storage/${mediaFile}`);
  try {
    fs.unlinkSync(pathToDelete);
  } catch (_err) {
    console.log('Aready deleted! (', pathToDelete, ')');
  }
  updatePostStatus(req.query.postId, 'deleted').then(() => {
    res.sendStatus(200);
  });
});

/**
 * Receives a post and adds it to the queue.
 * data: { id, mediaPath, usernameInImg, mediaType, caption, owner }
 *  * id: fetched post id
 *  * mediaPath: where the media is stored in the filesystem.
 *  * mediaType: IMAGE or VIDEO
 *  * caption: post caption
 *  * owner: post owner aka username
 */
router.post('/queue', authMiddleware, async (req: any, res) => {
  let media;
  const mediaPath = path.join(
    __dirname,
    `../../../storage/${req.body.data.mediaPath}`
  );

  if (req.body.data.mediaType === 'IMAGE') {
    media = await imageToBase64(mediaPath);
    try {
      fs.unlinkSync(mediaPath);
    } catch (_err) {
      console.log('Aready deleted! (', mediaPath, ')');
    }
  } else {
    media = `storage/${req.body.data.mediaPath}`;
  }
  const promise = addPostToQueue(
    media,
    req.body.data.mediaType,
    req.body.data.caption,
    req.body.data.owner
  );
  promise.then(() => {
    updatePostStatus(req.body.data.id, 'posted');
    res.sendStatus(200);
  });
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
});

module.exports = router;
