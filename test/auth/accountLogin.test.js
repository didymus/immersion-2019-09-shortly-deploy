const { expect } = require('chai');
const axios = require('axios');

const { User } = require('../../server/models');

describe('Account Login:', function() {
  beforeEach(function() {
    return User.create({
      username: 'Phillip',
      password: 'Phillip',
    });
  });

  it('Logs in existing users', function() {
    const body = {
      username: 'Phillip',
      password: 'Phillip',
    };

    return axios.post('http://127.0.0.1:8080/login', body, {
      // Not following redirect
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status <= 302
    }).then((response) => {
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/');
    });
  });

  it('Users that do not exist are kept on login page', function() {
    const body = {
      username: 'Fred',
      password: 'Fred',
    };

    return axios.post('http://127.0.0.1:8080/login', body, {
      // Not following redirect
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status <= 302
    }).then((response) => {
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/login');
    });
  });
});
