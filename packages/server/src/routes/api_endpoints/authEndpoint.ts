// /api/auth/<endpoint>

import express from 'express';

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
          res.send('SUCCESS');
        });
      }
    })(req, res, next);
  });

  router.get('/logout', (req: any, res) => {
    req.logout();
    res.send('SUCCESS');
  });

  router.get('/user', (req: any, res) => {
    res.send(req.user);
  });

  return router;
};
