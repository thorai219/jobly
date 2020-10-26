const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Company {

  static async findAll(data) {
    let query = `SELECT handle, name FROM companies`;
    let where = [];
    let values = [];

    if (+data.min_employees >= +data.max_employees) {
      throw new ExpressError(
        "Min employees must be less than max employees",
        400
      );
    }

    if (data.min_employees) {
      values.push(+data.min_employees);
      where.push(`num_employees >= $${values.length}`);
    }

    if (data.max_employees) {
      values.push(+data.max_employees);
      where.push(`num_employees <= $${values.length}`);
    }

    if (data.search) {
      values.push(`%${data.search}%`);
      where.push(`name ILIKE $${values.length}`);
    }

    if (where.length > 0) {
      query += " WHERE ";
    }

    let queryStr = query + where.join(" AND ") + " ORDER BY name";
    const companiesRes = await db.query(queryStr, values);
    return companiesRes.rows;
  }

  static async findOne(handle) {
    const companyRes = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
            FROM companies
            WHERE handle = $1`,
      [handle]
    );

    const company = companyRes.rows[0];

    if (!company) {
      throw new ExpressError(`There exists no company '${handle}'`, 404);
    }

    const jobsRes = await db.query(
      `SELECT id, title, salary, equity
            FROM jobs 
            WHERE company_handle = $1`,
      [handle]
    );

    company.jobs = jobsRes.rows;

    return company;
  }

  static async create(data) {
    const duplicateCheck = await db.query(
      `SELECT handle 
            FROM companies 
            WHERE handle = $1`,
      [data.handle]
    );

    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a company with handle '${data.handle}`,
        400
      );
    }

    const result = await db.query(
      `INSERT INTO companies 
              (handle, name, num_employees, description, logo_url)
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING handle, name, num_employees, description, logo_url`,
      [
        data.handle,
        data.name,
        data.num_employees,
        data.description,
        data.logo_url
      ]
    );

    return result.rows[0];
  }

  static async update(handle, data) {
    let { query, values } = sqlForPartialUpdate(
      "companies",
      data,
      "handle",
      handle
    );

    const result = await db.query(query, values);
    const company = result.rows[0];

    if (!company) {
      throw new ExpressError(`There exists no company '${handle}`, 404);
    }

    return company;
  }

  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
          WHERE handle = $1 
          RETURNING handle`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There exists no company '${handle}`, 404);
    }
  }
}

module.exports = Company;