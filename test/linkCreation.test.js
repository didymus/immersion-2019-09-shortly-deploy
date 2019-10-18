const { expect } = require('chai');
const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

const { Link } = require('../server/models');

describe('Link creation', function() {
  let requestWithSession;
  let cookieJar;

  axiosCookieJarSupport(axios);

  beforeEach(function() {
    cookieJar = new tough.CookieJar();
    requestWithSession = axios.create({
      withCredentials: true,
      jar: cookieJar,
    });

    const body = {
      username: 'admin',
      password: 'admin',
    };

    return requestWithSession.post('http://127.0.0.1:8080/signup', body);
  });

  afterEach(function() {
    return requestWithSession('http://127.0.0.1:8080/logout');
  });

  it('Only shortens valid urls, returning a 404 - Not found for invalid urls', function() {
    const body = {
      url: 'definitely not a valid url',
    };

    return requestWithSession.post('http://127.0.0.1:8080/links', body, {
      validateStatus: status => true
    }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });

  describe('Shortening links', function() {
    it('Responds with the short code', function() {
      const body = {
        url: 'http://www.roflzoo.com/',
      };

      return requestWithSession.post('http://127.0.0.1:8080/links', body)
        .then((response) => {
          expect(response.status).to.equal(200);
          expect(response.data.url).to.equal('http://www.roflzoo.com/');
          expect(response.data.code).to.be.ok;
        });
    });

    it('New links create a database entry', function() {
      const body = {
        url: 'http://www.roflzoo.com/',
      };

      return requestWithSession.post('http://127.0.0.1:8080/links', body)
        .then((response) => {
          expect(response.status).to.equal(200);

          return Link.findOne({ url: 'http://www.roflzoo.com/' }).exec();
        })
        .then((link) => {
          expect(link.url).to.equal('http://www.roflzoo.com/');
        });
    });

    it('Fetches the link url title', function() {
      const body = {
        url: 'http://www.roflzoo.com/',
      };

      return requestWithSession.post('http://127.0.0.1:8080/links', body)
        .then((response) => {
          expect(response.status).to.equal(200);

          return Link.findOne({ url: 'http://www.roflzoo.com/' }).exec();
        })
        .then((link) => {
          expect(link.title).to.equal('Funny pictures of animals, funny dog pictures');
        });
    });
  });

  describe('With previously saved urls', function() {
    let link;

    beforeEach(function() {
      return Link.create({
        url: 'http://www.roflzoo.com/',
        title: 'Funny pictures of animals, funny dog pictures',
        baseUrl: 'http://127.0.0.1:4568',
        visits: 0,
      }).then((newLink) => {
        link = newLink;
      });
    });

    it('Returns the same shortened code if attempted to add the same URL twice', function() {
      const firstCode = link.code;
      const body = {
        url: 'http://www.roflzoo.com/',
      };

      return requestWithSession.post('http://127.0.0.1:8080/links', body)
        .then((response) => {
          expect(response.status).to.equal(200);

          const secondCode = response.data.code;
          expect(secondCode).to.equal(firstCode);
        });
    });

    it('Shortcode redirects to correct url', function() {
      const sha = link.code;

      return requestWithSession.get(`http://127.0.0.1:8080/${sha}`, {
        // Not following redirect
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status <= 302
      }).then((response) => {
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal('http://www.roflzoo.com/');
      });
    });
  });
});
