const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Company {

  static async getAll(q) {
      // find all companies and can be filtered by number of employees
    let query = `SELECT handle, name FROM companies WHERE`;
    let where = [];
    let values = [];

    if (+q.min_employees >= +q.max_employees) {
      throw new ExpressError("Min employees can't be greater than max employees", 400)
    }

    if (q.min_employees) {
      values.push(+q.min_employees);
      where.push(`num_employees >= $${values.length}`)
    }

    if (q.max_employees) {
      values.push(+data.max_employees);
      where.push(`num_employees >= $${values.length}`)
    }

    if (q.search) {
      values.push(`%${q.search}%`)
      where.push(`name ILIKE $${values.length}`)
    }

    let searchQuery = query + where.join(" AND ") + " ORDER BY name";
    const result = await db.query(searchQuery, values)
    return result.rows;
  }


  static async getOne(handle) {
      // find one company with handle and it's available jobs
    const companyResult = await db.query(
      `SELECT handle, name FROM companies
      WHERE name ILIKE $1`, [handle]
    )
    if (companyResult.rows.length === 0) {
      throw new ExpressError(`${handle} doesn't exist`, 404)
    }
    let company = companyResult.rows[0];

    const jobResult = await db.query(`
      SELECT id, title, salary, equity FROM jobs WHERE company_handle = $1
    `, [handle])
    company.jobs = jobResult.rows;
    return company; 
  }
  

  static async addCompany(data) {
      // add a company to database
    const existing = await db.query(
      `SELECT handle FROM companies WHERE handle = $1`,
      [data.handle]
    )
    if (existing.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO companies (handle, name, num_employees, logo_url)
        VALUES ($1,$2,$3,$4)
        RETURNING handle, name, num_employees, logo_url`
        ,[data.handle, data.name, data.num_employees, data.logo_url]
      )
      return result.rows;
    }
    throw new ExpressError(`${data.handle} already exists!`, 400)
  }


  static async update(handle, data) {
      // update a company allowing for partial updatess
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


  static async delete(handle) {
      //delete a company
    const result = await db.query(`
      DELETE FROM companies WHERE id=$1 RETURNING handle
    `, [handle]
    )

    if (result.rows.length === 0) {
      throw new ExpressError(`There exists no company '${handle}`, 404);
    }
  }
}

module.exports = Company;