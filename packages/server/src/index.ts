import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { connect } from './database/DatabaseHandler';
import TasksManager from './tasks/TasksManager';

const bodyParser = require('body-parser');

require('./authentication/passportConfig')(passport);
const captureConsole = require('capture-console');

// ----------------------- END OF IMPORTS -----------------------

const clientPath = '../../client/build';
const app = express();
const port = process.env.PORT || 8080; // default port to listen
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

captureConsole.startCapture(process.stdout, (stdout) => {
  global.appSTDOUT += stdout;
});
TasksManager();
// ----------------------- END OF TASKS -----------------------

app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`);
});
// ----------------------- END OF SERVER -----------------------
