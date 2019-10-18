const express = require('express');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const path = require('path');

const cookieParser = require('./middleware/cookieParser');
const { createSession, verifySession } = require('./middleware/auth');
const { Link, Session, Click, User } = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser);
app.use(createSession);

app.get('/', verifySession, (req, res) => {
  res.render('index');
});

app.get('/create', verifySession, (req, res) => {
  res.render('index');
});

app.get('/links', verifySession, (req, res) => {
  Link.getAll()
    .then((links) => {
      res.status(200).send(links);
    })
    .catch((error) => {
      console.error('Failed to get links', error);
      res.sendStatus(500);
    });
});

app.post('/links', verifySession, (req, res) => {
  const { url } = req.body;

  if (!Link.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return Link.get({ url })
    .then((link) => {
      if (link) {
        return link;
      }

      return Link.getUrlTitle(url)
        .then(title => Link.create({
          url,
          title,
          baseUrl: req.headers.origin,
        }))
        .then(queryResponse => Link.get({ id: queryResponse.insertId }));
    })
    .then((link) => {
      return res.status(200).send(link);
    })
    .catch((error) => {
      console.error('Failed to create new link', error);
      res.sendStatus(500);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const { hash } = req.session;

  return User.get({ username })
    .then((user) => {
      if (!user || !User.compare(password, user.password, user.salt)) {
        // user doesn't exist or the password doesn't match
        return res.redirect('/login');
      }

      return Session.update({ hash }, { userId: user.id })
        .then(() => res.redirect('/'));
    })
    .catch((error) => {
      console.error('Failed to login', error);
      res.sendStatus(500);
    });
});

app.get('/logout', (req, res) => {
  const hash = req.cookies.shortlyid;

  return Session.delete({ hash })
    .then(() => {
      res.clearCookie('shortlyid');
      res.redirect('/login');
    })
    .catch((error) => {
      console.error('Failed to logout', error);
      res.sendStatus(500);
    });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const { hash } = req.session;

  return User.get({ username })
    .then((user) => {
      if (user) {
        // user already exists; redirect
        return res.redirect('/signup');
      }

      return User.create({ username, password })
        .then(queryResponse => Session.update(
          { hash },
          { userId: queryResponse.insertId },
        ))
        .then(() => res.redirect('/'));
    })
    .catch((error) => {
      console.error('Failed to signup', error);
      res.sendStatus(500);
    });
});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res) => {
  const { code } = req.params;

  return Link.get({ code })
    .then((link) => {
      if (!link) {
        return res.redirect('/');
      }

      return Click.create({ linkId: link.id })
        .then(() => Link.update(link, { visits: link.visits + 1 }))
        .then(() => {
          res.redirect(link.url);
        });
    })
    .catch((error) => {
      console.error('Failed get link', error);
      res.sendStatus(500);
    });
});

module.exports = app;
