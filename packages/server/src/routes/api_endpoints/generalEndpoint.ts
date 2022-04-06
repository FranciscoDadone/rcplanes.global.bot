// /api/general/<endpoint>
import bcrypt from 'bcryptjs';
import express from 'express';
import passport from 'passport';
import fs from 'fs';
import path from 'path';
import { getVideoDurationInSeconds } from 'get-video-duration';
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
import { trimVideo } from '../../utils/trimVideo';

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
  const { sessionid } = await getCredentials();
  await setCredentials(
    req.body.data.username,
    req.body.data.password,
    sessionid,
    req.body.data.fbId,
    req.body.data.accessToken,
    req.body.data.clientSecret,
    req.body.data.clientId
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
  const { hashtagFetchingEnabled, autoPosting } = await getGeneralConfig();
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

/**
 * Returns video duration in seconds of a given path.
 */
router.post('/video_duration', authMiddleware, async (req: any, res) => {
  await getVideoDurationInSeconds(`storage/${req.body.data.path}`).then(
    (duration) => {
      res.send(Math.ceil(duration).toString());
    }
  );
});

router.post('/trim_video', authMiddleware, async (req: any, res) => {
  await trimVideo(
    req.body.data.path,
    req.body.data.start,
    req.body.data.end - req.body.data.start
  ).then((success) => {
    res.send(success ? 'SUCCESS' : 'FAIL');
  });
});

router.post('/delete_from_storage', authMiddleware, async (req: any, res) => {
  const pathToDelete = path.join(
    __dirname,
    `../../../storage/${req.body.data.fileName}`
  );
  try {
    fs.unlinkSync(pathToDelete);
  } catch (ex) {
    console.log(ex);
  }
  res.sendStatus(200);
});

module.exports = router;
