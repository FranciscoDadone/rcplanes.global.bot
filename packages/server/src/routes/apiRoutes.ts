import express from 'express';
import passport from 'passport';
import path from 'path';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getAllNonDeletedPosts,
  getGeneralConfig,
  updatePostStatus,
  getQueue,
  addPostToQueue,
  swapInQueue,
  removePostFromQueue,
  updateQueuePostCaption,
  getCredentials,
  getAllHashtagsToFetch,
  addHashtagToFetch,
  deleteHashtag,
  setCredentials,
  setGeneralConfig,
} from '../database/DatabaseQueries';
import { addWatermark } from '../utils/addWatermark';

const bodyParser = require('body-parser');

const router = express.Router();

require('../authentication/passportConfig')(passport);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// ----------------------- END OF MIDDLEWARES -----------------------

router.get('/user', authMiddleware, (req: any, res) => {
  res.send(req.user);
});

router.get('/fetchedPosts', authMiddleware, (req: any, res) => {
  getAllNonDeletedPosts().then((data) => {
    res.send(data);
  });
});

router.get('/generalConfig', authMiddleware, (req: any, res) => {
  getGeneralConfig().then((data) => {
    res.send(data);
  });
});

router.get('/credentials', authMiddleware, (req: any, res) => {
  getCredentials().then((data) => {
    res.send(data);
  });
});

router.get('/hashtags', authMiddleware, async (req: any, res) => {
  await getAllHashtagsToFetch().then((data) => {
    res.send(data);
  });
});

router.get('/postProcessImage', authMiddleware, (req: any, res) => {
  addWatermark(
    path.join(__dirname, `../../storage/${req.query.image}`),
    req.query.username
  ).then((data) => {
    res.send(data);
  });
});

router.delete('/deletePost', authMiddleware, (req: any, res) => {
  updatePostStatus(req.query.postId, 'deleted').then(() => {
    res.sendStatus(200);
  });
});

router.post('/queuePost', authMiddleware, async (req: any, res) => {
  const media = await addWatermark(
    path.join(__dirname, `../../storage/${req.body.data.mediaPath}`),
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

router.get('/queue', authMiddleware, (req: any, res) => {
  getQueue().then((data) => {
    res.send(data);
  });
});

router.post('/queue/swap', authMiddleware, (req: any, res) => {
  const promise = swapInQueue(req.body.data.id1, req.body.data.id2);
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

router.delete('/queue/delete', authMiddleware, (req: any, res) => {
  const promise = removePostFromQueue(req.query.id);
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

router.patch('/queue/updatePost', authMiddleware, (req: any, res) => {
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

router.post('/addHashtagToFetch', authMiddleware, async (req: any, res) => {
  await addHashtagToFetch(req.body.data.hashtag).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

router.post('/deleteHashtag', authMiddleware, async (req: any, res) => {
  await deleteHashtag(req.body.data.hashtag).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

router.post('/setCredentials', authMiddleware, async (req: any, res) => {
  await setCredentials(
    req.body.data.accessToken,
    req.body.data.clientSecret,
    req.body.data.clientId,
    req.body.data.igAccountId
  ).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

router.post('/setGeneralConfig', authMiddleware, async (req: any, res) => {
  await setGeneralConfig(
    req.body.data.uploadRate,
    req.body.data.descriptionBoilerplate,
    req.body.data.hashtagFetchingEnabled
  );
});

module.exports = router;
