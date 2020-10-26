const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { admin, authed } = require('../middleware/auth');
const Job = require('../models/Job');
const { validate } = require('jsonschema');
const { jobNewSchema, jobUpdateSchema } = require('../schemas');
const router = express.Router({ mergeParams: true });

// get all jobs
router.get('/', authed, async function(req, res, next) {
  try {
    const jobs = await Job.findAll(req.query);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

// get a job by id
router.get('/:id', authed, async function(req, res, next) {
  try {
    const job = await Job.findOne(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// post a job if admin
router.post('/', admin, async function(req, res, next) {
  try {
    const validation = validate(req.body, jobNewSchema);

    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

// update a job information
router.patch('/:id', admin, async function(req, res, next) {
  try {
    if ('id' in req.body) {
      throw new ExpressError('You are not allowed to change the ID', 400);
    }

    const validation = validate(req.body, jobUpdateSchema);
    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// delete a job
router.delete('/:id', admin, async function(req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ message: 'Job deleted' });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;