const express = require("express")
const Company = require("../models/company");
const companySchema = require("../schema/companySchema.json")
const { validate } = require("jsonschema")

const router = new express.Router();


router.get("/companies", async (req, res, next) => {
  try {
    const companys = await Company.findAll(req.query)
    return res.json({ companies });
  } catch(e) {
    return next(e)
  }
})