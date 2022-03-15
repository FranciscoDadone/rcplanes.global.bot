import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { connect } from './database/DatabaseHandler';
import { authMiddleware } from './middlewares/authMiddleware';

const bodyParser = require('body-parser');

require('./authentication/passportConfig')(passport);

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
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
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

const authRouter = require('./routes/authRoutes');
const apiRouter = require('./routes/apiRoutes');

app.use('/auth', authRouter(passport));
app.use('/api', apiRouter);
// ----------------------- END OF ROUTES -----------------------

// start the Express server
app.listen(port, () => {
  console.log(`App started at http://localhost:${port}`);
});
