export function authMiddleware(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.send('NOT_AUTHENTICATED');
}

module.exports = {
  authMiddleware,
};
