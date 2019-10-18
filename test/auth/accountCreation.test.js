const { expect } = require('chai');
const axios = require('axios');

const { User } = require('../../server/models');

describe('Account Creation:', function() {
  it('Signup creates a new user', function() {
    const body = {
      username: 'Svnh',
      password: 'Svnh',
    };

    return axios.post('http://127.0.0.1:8080/signup', body, {
      // Not following redirect
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status <= 302
    }).then((response) => {
      expect(response.status).to.equal(302);

      return User.findOne({ username: 'Svnh' }).exec();
    }).then((user) => {
      expect(user.username).to.equal('Svnh');
    });
  });

  it('Successful signup logs in a new user', function() {
    const body = {
      username: 'Phillip',
      password: 'Phillip',
    };

    return axios.post('http://127.0.0.1:8080/signup', body, {
      // Not following redirect
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status <= 302
    }).then((response) => {
      expect(response.status).to.equal(302);
      expect(response.headers.location).to.equal('/');

      return axios.get('http://127.0.0.1:8080/logout');
    }).then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
