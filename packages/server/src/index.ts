import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { connect } from './database/DatabaseHandler';
import TasksManager from './tasks/TasksManager';
import { igLogin } from './services/instagramAPI.service';
import { getQueue } from './database/DatabaseQueries';

const bodyParser = require('body-parser');

require('./authentication/passportConfig')(passport);
const captureConsole = require('capture-console');

// ----------------------- END OF IMPORTS -----------------------

const clientPath = '../../client/build';
const app = express();
const port = process.env.PORT || 8080; // default port to listen

if (!process.env.BASE_URL) process.env.BASE_URL = 'http://localhost:8000';
// ----------------------- END OF CONSTANTS -----------------------

connect();
// ----------------------- END OF DATABASE -----------------------

// Serve static resources from the "public" folder
app.use(express.static(path.join(__dirname, clientPath)));

app.use('/storage', express.static(path.join(__dirname, '../storage')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secretcode'));
app.use(
  session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// ----------------------- END OF MIDDLEWARES -----------------------

const authRouter = require('./routes/api_endpoints/authEndpoint');
const apiRouter = require('./routes/apiRoutes');
const postsRouter = require('./routes/api_endpoints/postsEndpoint');
const generalRouter = require('./routes/api_endpoints/generalEndpoint');
const queueRouter = require('./routes/api_endpoints/queueEndpoint');
const hashtagsRouter = require('./routes/api_endpoints/hashtagsEndpoint');

app.use('/auth', authRouter(passport));
app.use('/api', apiRouter);
app.use('/api/posts', postsRouter);
app.use('/api/general', generalRouter);
app.use('/api/queue', queueRouter);
app.use('/api/hashtags', hashtagsRouter);

// ----------------------- END OF ROUTES -----------------------

global.appStatus = 'Idling...';
global.appSTDOUT = '';
// ----------------------- END OF GLOBAL VARS -----------------------
function login() {
  igLogin().then(async (loggedIn) => {
    if (!loggedIn) {
      console.log('INCORRECT INSTAGRAM CREDENTIALS!');
      console.log('RETRYING LOGIN IN 30 SECONDS...');
      await new Promise((resolve) => setTimeout(resolve, 30000));
      login();
    } else {
      console.log('Successfully logged in to Instagram!');
      TasksManager();
    }
  });
}
login();
// ----------------------- END OF INSTAGRAM INIT -----------------------

/**
 * This is to check for dangling uploaded files on every restart.
 * Checks the current queue, finds custom files and compares it to the storage,
 * if there is a file (custom) in storage that is not in queue it deletes it.
 */
(async () => {
  const queuedMedias = await getQueue();
  const customPostsPathsInDB: string[] = [];
  queuedMedias.forEach((post) => {
    if (post.media.includes('storage/'))
      customPostsPathsInDB.push(post.media.split('/')[1]);
  });
  const pathToStorage = path.join(__dirname, `../storage`);
  const files = fs.readdirSync(pathToStorage);
  files.forEach((file) => {
    if (file.includes('custom_') && !customPostsPathsInDB.includes(file)) {
      try {
        fs.unlinkSync(path.join(pathToStorage, file));
      } catch (ex) {
        console.log(ex);
      }
    }
  });
})();
// ----------------------- END OF CUSTOM POSTS CHECK -----------------------

captureConsole.startCapture(process.stdout, (stdout) => {
  global.appSTDOUT += `[${moment(new Date(), 'DD/MM/YYYY HH:mm:ss').format(
    'DD/MM/YYYY HH:mm:ss'
  )}] ${stdout}`;
});
// ----------------------- END OF TASKS -----------------------

app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`);
});
// ----------------------- END OF SERVER -----------------------
