// /api/general/<endpoint>
import bcrypt from 'bcryptjs';
import express from 'express';
import passport from 'passport';
import { authMiddleware } from '../../middlewares/authMiddleware';
import {
  getGeneralConfig,
  getCredentials,
  setCredentials,
  setGeneralConfig,
  getUtil,
  getUserFromId,
  updateUserFromId,
} from '../../database/DatabaseQueries';
import TasksManager from '../../tasks/TasksManager';

const bodyParser = require('body-parser');

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

require('../../authentication/passportConfig')(passport);

// -------------------------- END OF MIDDLEWARES -----------------------------

/**
 * Returns the general config
 * { uploadRate, descriptionBoilerplate, hashtagFetching, autoPosting }
 */
router.get('/general_config', authMiddleware, (req: any, res) => {
  getGeneralConfig().then((data) => {
    res.send(data);
  });
});

/**
 * Returns the stored Instagram/Facebook credentials
 * { accessToken, clientSecret clientId, igAccountId }
 */
router.get('/credentials', authMiddleware, (req: any, res) => {
  getCredentials().then((data) => {
    res.send(data);
  });
});

/**
 * Receives Instagram/Facebook credentials and stores them in the database.
 * data: { accessToken, clientSecret, clientId, igAccountId }
 */
router.post('/set_credentials', authMiddleware, async (req: any, res) => {
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

/**
 * Receives general config fields and stores them in the database.
 * data: { uploadRate, descriptionBoilerplate, hashtagFetching, autoPosting }
 */
router.post('/set_general_config', authMiddleware, async (req: any, res) => {
  const hashtagFetchingEnabled = await (
    await getGeneralConfig()
  ).hashtagFetchingEnabled;
  const autoPosting = await (await getGeneralConfig()).autoPosting;
  let sendTaskFetching = false;
  let sendTaskPosting = false;
  if (hashtagFetchingEnabled !== req.body.data.hashtagFetchingEnabled) {
    sendTaskFetching = true;
  }
  if (autoPosting !== req.body.data.autoPosting) {
    sendTaskPosting = true;
  }
  await setGeneralConfig(
    req.body.data.uploadRate,
    req.body.data.descriptionBoilerplate,
    req.body.data.hashtagFetchingEnabled,
    req.body.data.autoPosting
  );
  if (sendTaskFetching) TasksManager('fetching');
  if (sendTaskPosting) {
    if (req.body.data.autoPosting) console.log('Auto-posting enabled! :)');
    else console.log('Auto-posting disabled! :(');
  }
  res.sendStatus(200);
});

/**
 * Returns { lastUploadDate, totalPostedMedias, queuedMedias }
 */
router.get('/util', authMiddleware, async (req: any, res) => {
  const promise = getUtil();
  promise.then((data) => {
    res.send(data);
  });
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
});

/**
 * Receives the old password to compare the proceed with the change and the new username and password.
 * Returns 'SUCCESS' if the change succeded and 'PASSWORD_MISSMACH' if the old password doesn't match with the one on the database.
 * data: { oldPassword, newPassword, newUsername }
 */
router.post(
  '/change_dashboard_credentials',
  authMiddleware,
  async (req: any, res) => {
    const currentUser = await getUserFromId(1);
    bcrypt
      .compare(req.body.data.oldPassword, currentUser.hashedPassword)
      .then((match) => {
        if (match) {
          updateUserFromId(
            currentUser.id,
            req.body.data.newUsername,
            req.body.data.newPassword
          ).then(() => {
            res.send('SUCCESS');
          });
        } else res.send('PASSWORD_MISSMACH');
      });
  }
);

/**
 * Returns the server logs at runtime.
 */
router.get('/logs', authMiddleware, (req: any, res) => {
  res.send(global.appSTDOUT);
});

module.exports = router;
