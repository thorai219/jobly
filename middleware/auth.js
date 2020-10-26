const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/ExpressError");

function authed(req, res, next) {
  try {
    const tokenStr = req.body._token || req.query._token;
    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;
    return next();
  } catch (err) {
    console.log(err)
    return next(new ExpressError("You must authenticate first", 401));
  }
}

function admin(req, res, next) {
  try {
    const tokenStr = req.body._token;
    
    let token = jwt.verify(tokenStr, SECRET_KEY);
    
    res.locals.username = token.username;

    if (token.is_admin === true) {
      return next();
    }

    throw new Error();
  } catch (err) {
    return next(new ExpressError("You must be an admin to access", 401));
  }
}

function correctUser(req, res, next) {
  try {
    const tokenStr = req.body._token;
    
    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;
    if (token.username === req.params.username) {
      return next();
    }

    throw new Error();
  } catch (err) {
    return next(new ExpressError("Unauthorized", 401));
  }
}

module.exports = {
  authed,
  admin,
  correctUser
};