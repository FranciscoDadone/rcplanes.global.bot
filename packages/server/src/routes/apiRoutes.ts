import express from 'express';
import passport from 'passport';
import path from 'path';
import { getQueuePost } from '../database/DatabaseQueries';
import { authMiddleware } from '../middlewares/authMiddleware';
import { addWatermark } from '../utils/addWatermark';

const bodyParser = require('body-parser');

const router = express.Router();

require('../authentication/passportConfig')(passport);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// ----------------------- END OF MIDDLEWARES -----------------------

/**
 * Gets current authenticated user.
 */
router.get('/user', authMiddleware, (req: any, res) => {
  res.send(req.user);
});

/**
 * Receives a instagram post id (stored image name) and username and returns a
 * postprocessed image with the watermark.
 * params: { image, username }
 * image: instagram post id (stored image path)
 */
router.get('/post_process_image', authMiddleware, (req: any, res) => {
  addWatermark(
    path.join(__dirname, `../../storage/${req.query.image}`),
    req.query.username
  ).then((data) => {
    res.send(data);
  });
});

/**
 * Receives a post id stored in the queue and username and returns a
 * postprocessed image with the watermark.
 * params: { image, username }
 * image: instagram post id (stored image path)
 */
router.get(
  '/post_process_image/by_id',
  authMiddleware,
  async (req: any, res) => {
    const queuePost = await getQueuePost(req.query.id);
    if (!queuePost) return;
    const { media } = queuePost;
    addWatermark(media, req.query.username).then((data) => {
      res.send(data);
    });
  }
);

/**
 * Returns the current app status.
 */
router.get('/status', authMiddleware, (req: any, res) => {
  if (global.appStatus) res.send(global.appStatus);
  else res.send('Idling...');
});

module.exports = router;
