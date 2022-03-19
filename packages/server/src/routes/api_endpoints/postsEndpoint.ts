// /api/posts/<endpoint>

import express from 'express';
import passport from 'passport';
import path from 'path';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getAllNonDeletedPosts,
  updatePostStatus,
  addPostToQueue,
  getAllPostsJSON,
} from '../../database/DatabaseQueries';
import { addWatermark } from '../../utils/addWatermark';

const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

require('../../authentication/passportConfig')(passport);

// -------------------------- END OF MIDDLEWARES -----------------------------

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

router.get('/all_fetched_posts', authMiddleware, (req: any, res) => {
  const promise = getAllPostsJSON();
  promise.then((data) => {
    res.send(data);
  });
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
});

router.delete('/delete_post', authMiddleware, (req: any, res) => {
  updatePostStatus(req.query.postId, 'deleted').then(() => {
    res.sendStatus(200);
  });
});

router.post('/queue_post', authMiddleware, async (req: any, res) => {
  const media = await addWatermark(
    path.join(__dirname, `../../../storage/${req.body.data.mediaPath}`),
    req.body.data.usernameInImg
  );
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
