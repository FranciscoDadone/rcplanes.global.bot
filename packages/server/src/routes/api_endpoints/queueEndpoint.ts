// /api/queue/<endpoint>

import express from 'express';
import passport from 'passport';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getQueue,
  swapInQueue,
  removePostFromQueue,
  updateQueuePostCaption,
} from '../../database/DatabaseQueries';

const bodyParser = require('body-parser');

const router = express.Router();

require('../../authentication/passportConfig')(passport);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// ----------------------- END OF MIDDLEWARES -----------------------

router.get('/queue', authMiddleware, (req: any, res) => {
  getQueue().then((data) => {
    res.send(data);
  });
});

router.post('/swap', authMiddleware, (req: any, res) => {
  const promise = swapInQueue(req.body.data.id1, req.body.data.id2);
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

router.delete('/delete', authMiddleware, (req: any, res) => {
  const promise = removePostFromQueue(req.query.id);
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
  promise.then(() => {
    res.sendStatus(200);
  });
});

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
