const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

function authed (req, res, next) {
  try {
    // grab token from either body or query str
    const tokenStr = req.body._token || req.query._token;
    // return the verified token, compare with original token signature
    let token = jwt.verify(tokenStr, SECRET_KEY);
    // append username to res.locals which is global to use in view funcitions
    res.locals.username = token.username;
    return next();
  } catch(e) {
    return next(e)
  }
}

function admin (req, res, next) {
  try {
    // grab the token
    const tokenStr = req.body._token;

    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;
    // verify if is_admin
    if (token.is_admin) {
      return next();
    }
    //if not throw err to catch it on catch block
    throw new Error();
  } catch(e) {
    return next(new ExpressError("You must be an admin to access", 401));
  }
}

function correctUser (req, res, next) {
  try {
    const tokenStr = req.body._token;

    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    if (token.username === req.params.username) {
      return next();
    }

    throw new Error();
  } catch(e) {
    return next(new ExpressError("Unauthorized", 401));
  }
}

module.exports = {
  authed,
  admin,
  correctUser
}