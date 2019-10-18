const models = require('../models');

module.exports.createSession = (req, res, next) => {
  const hash = req.cookies.shortlyid;

  Promise.resolve(hash)
    .then((hash) => {
      if (!hash) {
        throw hash;
      }
      return Session.get({ hash });
    })
    .then((session) => {
      if (!session) {
        throw session;
      }
      return session;
    })
    // initializes a new session
    .catch(() => {
      return Session.create()
        .then(queryResponse => Session.get({ id: queryResponse.insertId }))
        .then((session) => {
          res.cookie('shortlyid', session.hash);
          return session;
        });
    })
    .then((session) => {
      req.session = session;
      next();
    });
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
module.exports.verifySession = (req, res, next) => {
  if (!Session.isLoggedIn(req.session)) {
    res.redirect('/login');
  } else {
    next();
  }
};
