import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getAllNonDeletedPosts,
  getGeneralConfig,
  updatePostStatus
} from '../database/DatabaseQueries';
import { addWatermark } from '../utils/addWatermark';

const bodyParser = require('body-parser');

const router = express.Router();

require('../authentication/passportConfig')(passport);

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
router.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

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

router.get('/postProcessImage', authMiddleware, (req: any, res) => {
  addWatermark(
    path.join(__dirname, `../../storage/${req.query.image}`),
    req.query.username
  ).then((data) => {
    res.send(data);
  });
});

router.delete('/deletePost', authMiddleware, (req: any) => {
  updatePostStatus(req.query.post_id, 'deleted');
});

module.exports = router;
