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

router.get('/general_config', authMiddleware, (req: any, res) => {
  getGeneralConfig().then((data) => {
    res.send(data);
  });
});

router.get('/credentials', authMiddleware, (req: any, res) => {
  getCredentials().then((data) => {
    res.send(data);
  });
});

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

router.get('/get_util', authMiddleware, async (req: any, res) => {
  const promise = getUtil();
  promise.then((data) => {
    res.send(data);
  });
  promise.catch((err) => {
    if (err) res.sendStatus(500);
  });
});

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

router.get('/stdout', authMiddleware, (req: any, res) => {
  res.send(global.appSTDOUT);
});

module.exports = router;
