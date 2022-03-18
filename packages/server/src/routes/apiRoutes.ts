import express from 'express';
import passport from 'passport';
import path from 'path';
import { authMiddleware } from '../middlewares/authMiddleware';
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

router.get('/post_process_image', authMiddleware, (req: any, res) => {
  addWatermark(
    path.join(__dirname, `../../storage/${req.query.image}`),
    req.query.username
  ).then((data) => {
    res.send(data);
  });
});

module.exports = router;
