import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { authMiddleware } from '../middlewares/authMiddleware';

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

module.exports = router;
