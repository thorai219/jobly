const express = require('express');
const ExpressError = require('../helpers/expressError');
const User = require('../models/users');
const { validate } = require('jsonschema');
const newUser = require('../schema/newUserSchema.json');
const { correctUser, authed } = require('../middleware/auth');
const updateUser = require('../schema/updateUserSchema.json')
const createToken = require('../helpers/token');

const router = new express.Router();

router.get("/", authed, async (req, res, next) => {
  // get all users
  try {
    const result = await User.getAll();
    return res.json({ result })
  } catch(e) {
    return next(e);
  }
})

router.get("/:username", authed, async (req, res, next) => {
  // get user by username
  try {
    const result = await User.getOne(req.params.username);
    return res.json({ result })
  } catch(e) {
    return next(e);
  }
})

router.post("/", async function(req, res, next) {
  // sign up user and create token 
  try {
    const valid = validate(req.data, newUser);

    if (!valid.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const result = await User.signup(req.body);
    const token = createToken(result)
    return res.status(201).json({ token });
  } catch(e) {
    return next(e)
  }
})

router.patch("/:username", correctUser, async (req, res, next) => {
  // update user profile
  try {
    const valid = validate(req.body, updateUser);
    if (!valid.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const result = await User.updateUser(req.params.username, req.body);
    return res.json({ result });
  } catch(e) {
    return next(e)
  }
})

router.delete("/:username", correctUser, async (req, res, next) => {
  // delete a user
  try {
    const result = await User.deleteUser(req.params.username)
    return res.json({ message: "user deleted!" })
  } catch(e) {
    return next(e)
  }
})

module.exports = router;
