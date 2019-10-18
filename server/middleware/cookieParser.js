const parseCookies = (req, res, next) => {
  const cookieString = req.get('Cookie') || '';
  const parsedCookies = cookieString.split('; ').reduce((cookies, cookie) => {
    if (cookie.length) {
      const index = cookie.indexOf('=');
      const key = cookie.slice(0, index);
      const token = cookie.slice(index + 1);
      cookies[key] = token;
    }
    return cookies;
  }, {});

  req.cookies = parsedCookies;

  next();
};

module.exports = parseCookies;