const axios = require('axios');

const app = require('../server/app');
const { User, Session, Link } = require('../server/models');

const PORT = 8080;

/////////////////////////////////////////////////////
// NOTE: these tests are designed for mongo!
/////////////////////////////////////////////////////

describe('Shortly', function() {
  let server;

  beforeEach(function(done) {
    server = app.listen(PORT, () => {
      // Log out currently signed in user
      axios.get('http://127.0.0.1:8080/logout')
        // Delete objects from db so they can be created later for the test
        .then(() => Promise.all([
          User.deleteMany({}),
          Session.deleteMany({}),
          Link.deleteMany({}),
        ]))
        .then(() => done())
        .catch(err => done(err));
    });
  });

  afterEach(function() {
    server.close();
  });

  describe('Auth', function() {
    require('./auth/accountCreation.test');
    require('./auth/accountLogin.test');
    require('./auth/privilegedAccess.test');
  });

  require('./linkCreation.test');
});
