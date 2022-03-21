// /api/auth/<endpoint>

import express from 'express';

module.exports = (passport) => {
  const router = express.Router();

  /**
   * Receives a username and password and returns:
   * 'SUCCESS' when authenticated AND 'INCORRECT_CREDENTIALS' when no user found with that credentials.
   * data: { username, password }
   */
  router.post('/login', (req: any, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    passport.authenticate('local', (err, user, info) => {
      if (err) throw err;
      if (!user) res.send('INCORRECT_CREDENTIALS');
      else {
        req.logIn(user, (err1) => {
          if (err1) throw err1;
          res.send('SUCCESS');
        });
      }
    })(req, res, next);
  });

  /**
   * Logs the user out.
   */
  router.post('/logout', (req: any, res) => {
    req.logout();
    res.send('SUCCESS');
  });

  /**
   * Gets the current logged user.
   */
  router.get('/user', (req: any, res) => {
    res.send(req.user);
  });

  return router;
};
