const User = require("../models/users");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/token");

router.post("/login", async function(req, res, next) {
  // authenticate user and log them in, create token
  try {
    const user = await User.authenticate(req.body);
    const token = createToken(user)
    return res.json({ token })
  } catch(e) {
    return next(e)
  }
})

module.exports = router;