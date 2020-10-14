const express = require("express")
const ExpressError = require('../helpers/expressError');
const Company = require("../models/company");
const newCompany = require("../schema/newCompanySchema.json");
const { admin, authed } = require('../middleware/auth');
const updateCompany = require("../schema/updateCompanySchema.json");
const { validate } = require("jsonschema");

const router = new express.Router();

router.get("/", authed, async (req, res, next) => {
  try {
    const result = await Company.getAll(req.query)
    return res.json({ result });
  } catch(e) {
    return next(e)
  }
})

router.get("/:handle", authed, async (req, res, next) => {
  try {
    const result = await Company.getOne(req.params.handle)
    return res.json({ result })
  } catch(e) {
    return next(e)
  }
})

router.post("/", async function(req, res, next) {
  try {
    const is_valid = validate(req.body, newCompany)
    if (!is_valid.valid) {
      throw new ExpressError(valid.errors.map(e => e.stack), 400);
    }

    const result = await Company.addCompany(req.body);
    return res.status(201).json({ result })
  } catch(e) {
    return next(e)
  }
})

router.patch("/:handle", admin, async (req, res, next) => {
  try {
    const valid = validation(req.body, updateCompany);

    if (!valid.valid) {
      throw new ExpressError(valid.errors.map(e => e.stack), 400);
    }
    const result = await Company.update(req.params.handle, req.body);
    return res.json({ result });
  } catch(e) {
    return next(e)
  }
})

router.delete("/:handle", admin, async (req, res, next) => {
  try {
    await Company.delete(req.params.handle)
    return res.json({ message: "Deleted!" })
  } catch(e) {
    return next(e)
  }
})

module.exports = router;
