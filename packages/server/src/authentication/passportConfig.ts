import {
  getUserFromUsername,
  getUserFromId,
} from '../database/DatabaseQueries';

const bcrypt = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;

module.exports = (passport) => {
  passport.use(
    // eslint-disable-next-line new-cap
    new localStrategy((username, password, done) => {
      return getUserFromUsername(username).then((user: any) => {
        if (!user) return done(null, false);
        return bcrypt.compare(password, user.hashedPassword, (err1, result) => {
          if (err1) throw err1;
          if (result) {
            return done(null, user);
          }
          return done(null, false);
        });
      });
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    getUserFromId(id).then((user: any) => {
      if (user === undefined) cb('User not found', null);
      else {
        const userInformation = {
          username: user.username,
        };
        cb(null, userInformation);
      }
    });
  });
};
