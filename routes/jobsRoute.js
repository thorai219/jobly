const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const Job = require('../models/Job');
const { validate } = require('jsonschema');
const { admin, authed } = require('../middleware/auth');
const newJob = require('../schema/newJobSchema.json');
const updateJob = require('../schema/updateJobSchema.json');

const router = new express.Router();

router.get("/", authed, async (req, res, next) => {
  // get all jobs
  try {
    const result = await Job.getAll(req.query);
    return res.json({ result })
  } catch(e) {
    return next(e)
  }
});

router.get("/:id", authed, async (req, res, next) => {
  // get job by id
  try {
    const result = await Job.getOne(req.params)
    return res.json({ result })
  } catch(e) {
    return next(e)
  }
});

router.post("/", admin, async (req, res, next) => {
  // post jobs
  try {
    const valid = validate(req.body, newJob);

    if (!valid.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const result = await Job.addJob(req.body);
    return res.status(201).json({ result });
  } catch(e) {
    return next(e)
  }
});

router.patch("/:id", admin, async (req, res, next) => {
  // update existing job desciption
  try {
    const valid = validate(req.body, updateJob);

    if (!valid.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const result = await Job.updateJob(req.params.id, req.body);
    return res.json({ result })
  } catch(e) {
    return next(e)
  }
});

router.delete("/:id", admin, async (req, res, next) => {
  // delete a job post
  try {
    await Job.deleteJob(req.params.id);
    return res.json({ message: "Job deleted" })
  } catch(e) {
    return next(e)
  }
});

module.exports = router;