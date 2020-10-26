/** Routes for users. */

const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { correctUser, authed } = require('../middleware/auth');
const User = require('../models/User');
const { validate } = require('jsonschema');
const { userNewSchema, userUpdateSchema } = require('../schemas');
const createToken = require('../helpers/createToken');
const router = express.Router();

// get all users
router.get('/', authed, async function(req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


// get user by username
router.get('/:username', authed, async function(req, res, next) {
  try {
    const user = await User.findOne(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


// register a new user
router.post('/', async function(req, res, next) {
  try {
    const validation = validate(req.body, userNewSchema);

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

// update user information
router.patch('/:username', correctUser, async function(req, res, next) {
  try {
    if ('username' in req.body || 'is_admin' in req.body) {
        throw new ExpressError(
          'You are not allowed to change username or admin privileges.',
          400);
    }

    const validation = validate(req.body, userUpdateSchema);
    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


// delete a user
router.delete('/:username', correctUser, async function(req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;