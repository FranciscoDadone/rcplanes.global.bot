import bcrypt from 'bcryptjs';
import express from 'express';
import { addUserToDB, getUserByUsername } from '../database/DatabaseQueries';

module.exports = (passport) => {
  const router = express.Router();

  router.post('/login', (req: any, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passport.authenticate('local', (err, user, info) => {
      if (err) throw err;
      if (!user) res.send('USER_DOESNT_EXIST');
      else {
        req.logIn(user, (err1) => {
          if (err1) throw err1;
          res.send('AUTH_SUCCESSFUL');
        });
      }
    })(req, res, next);
  });

  router.post('/register', (req, res) => {
    getUserByUsername(req.body.username).then(async (user) => {
      if (user) res.send('USER_ALREADY_EXISTS');
      if (!user) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await addUserToDB(req.body.username, hashedPassword);
        res.send('SUCCESS');
      }
    });
  });
  return router;
};
