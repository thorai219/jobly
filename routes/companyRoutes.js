const express = require("express")
const ExpressError = require('../helpers/ExpressError');
const Company = require("../models/company");
const companySchema = require("../schema/companySchema.json")
const { validate } = require("jsonschema")

const router = new express.Router();

router.get("/companies", async (req, res, next) => {
  try {
    const companies = await Company.getAll()
    return res.json({ companies });
  } catch(e) {
    return next(e)
  }
})

