const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function createToken(user) {
  // create payload for token and get signature
  const payload = {
    username: user.username,
    is_admin: user.is_admin
  }
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = createToken;