// /api/hashtags/<endpoint>

import express from 'express';
import passport from 'passport';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getAllHashtagsToFetch,
  addHashtagToFetch,
  deleteHashtag,
} from '../../database/DatabaseQueries';

const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

require('../../authentication/passportConfig')(passport);

// -------------------------- END OF MIDDLEWARES -----------------------------

router.post('/add', authMiddleware, async (req: any, res) => {
  await addHashtagToFetch(req.body.data.hashtag).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

router.post('/delete', authMiddleware, async (req: any, res) => {
  await deleteHashtag(req.body.data.hashtag).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

router.get('/hashtags', authMiddleware, async (req: any, res) => {
  await getAllHashtagsToFetch().then((data) => {
    res.send(data);
  });
});

module.exports = router;
