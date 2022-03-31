// /api/queue/<endpoint>

import express from 'express';
import passport from 'passport';
import fs from 'fs';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getQueue,
  swapInQueue,
  removePostFromQueue,
  updateQueuePostCaption,
  getQueuePost,
} from '../../database/DatabaseQueries';

const bodyParser = require('body-parser');

const router = express.Router();

require('../../authentication/passportConfig')(passport);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// ----------------------- END OF MIDDLEWARES -----------------------

/**
 * Returns an array of the current posts in queue.
 * Return: [{ id, media, mediaType, caption, owner }]
 */
router.get('/queue', authMiddleware, (req: any, res) => {
  getQueue().then((data) => {
    res.send(data);
  });
});

/**
 * Receives the id's of two posts and swaps them in the queue.
 * data: { id1, id2 }
 */
router.post('/swap', authMiddleware, (req: any, res) => {
  const promise = swapInQueue(req.body.data.id1, req.body.data.id2);
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

/**
 * Receives a post id and deletes that post from the queue.
 * params: { id }
 */
router.delete('/delete', authMiddleware, async (req: any, res) => {
  const { media, mediaType } = await getQueuePost(req.query.id);
  const promise = removePostFromQueue(req.query.id);
  if (mediaType === 'VIDEO' || mediaType === 'REEL') {
    try {
      fs.unlinkSync(media);
    } catch (_err) {
      console.log(_err);
    }
  }
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

/**
 * Receives a post id and the caption and updates it on the database.
 * data: { id, caption }
 */
router.patch('/update_post', authMiddleware, (req: any, res) => {
  const promise = updateQueuePostCaption(
    req.body.data.id,
    req.body.data.caption
  );
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

module.exports = router;
