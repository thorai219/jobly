const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const Job = require('../models/Job');
const { validate } = require('jsonschema');
const newJob = require('../schema/newJobSchema.json');
const updateJob = require('../schema/updateJobSchema.json');

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  try {
    const result = await Job.getAll(req.query);
    return res.json({ result })
  } catch(e) {
    return next(e)
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await Job.getOne(req.params)
    return res.json({ result })
  } catch(e) {
    return next(e)
  }
});

router.post("/", async (req, res, next) => {
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

router.patch("/:id", async (req, res, next) => {
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

router.delete("/:id", async (req, res, next) => {
  try {
    await Job.deleteJob(req.params.id);
    return res.json({ message: "Job deleted" })
  } catch(e) {
    return next(e)
  }
});

module.exports = router;