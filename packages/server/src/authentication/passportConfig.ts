import { getUserByUsername, getUserById } from '../database/DatabaseQueries';

const bcrypt = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;

module.exports = (passport) => {
  passport.use(
    // eslint-disable-next-line new-cap
    new localStrategy((username, password, done) => {
      return getUserByUsername(username).then((user: any) => {
        if (!user) return done(null, false);
        return bcrypt.compare(
          password,
          user.hashed_password,
          (err1, result) => {
            if (err1) throw err1;
            if (result) {
              return done(null, user);
            }
            return done(null, false);
          }
        );
      });
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    getUserById(id).then((user: any) => {
      if (user === undefined) cb('User not found', null);
      else {
        const userInformation = {
          username: user.username,
        };
        cb(null, userInformation);
      }
    });
    // cb(null, {username: 'lol'});
  });
};
