// /api/profiles/<endpoint>

import express from 'express';
import passport from 'passport';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getAllProfilesToFetch,
  addProfileToFetch,
  deleteProfile,
} from '../../database/DatabaseQueries';

const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

require('../../authentication/passportConfig')(passport);

// -------------------------- END OF MIDDLEWARES -----------------------------

/**
 * Receives a new username and adds it to the database of profiles to fetch.
 * data: { username }
 */
router.post('/add', authMiddleware, async (req: any, res) => {
  await addProfileToFetch(req.body.data.username).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

/**
 * Receives a username and deletes it from the database of profiles to fetch.
 * params: { username }
 */
router.delete('/delete', authMiddleware, async (req: any, res) => {
  await deleteProfile(req.query.username).catch((err) => {
    if (err) res.sendStatus(500);
  });
  res.sendStatus(200);
});

/**
 * Returns all the profiles to fetch.
 */
router.get('/profiles', authMiddleware, async (req: any, res) => {
  await getAllProfilesToFetch().then((data) => {
    res.send(data);
  });
});

module.exports = router;
