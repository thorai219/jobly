const User = require("../models/User");
const express = require("express");
const router = new express.Router();
const createToken = require("../helpers/token");

router.post("/login", async (req, res, next) => {
  // authenticate user and log them in, create token
  try {
    const result = await User.authenticate(req.body);
    const token = createToken(result)
    return res.json({ token })
  } catch(e) {
    return next(e)
  }
})

module.exports = router;