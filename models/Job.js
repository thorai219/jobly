const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {

  static async findAll(data) {
    let query = "SELECT id, title, company_handle FROM jobs";
    let where = [];
    let values = [];

    if (data.min_salary) {
      values.push(+data.min_employees);
      where.push(`min_salary >= $${values.length}`);
    }

    if (data.max_equity) {
      values.push(+data.max_employees);
      where.push(`min_equity >= $${values.length}`);
    }

    if (data.search) {
      values.push(`%${data.search}%`);
      where.push(`title ILIKE $${values.length}`);
    }

    if (where.length > 0) {
      query += " WHERE ";
    }

    let queryStr = query + where.join(" AND ");
    const jobsRes = await db.query(queryStr, values);
    return jobsRes.rows;
  }

  static async findOne(id) {
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle 
        FROM jobs 
        WHERE id = $1`,
      [id]
    );

    const job = jobRes.rows[0];

    if (!job) {
      throw new ExpressError(`There exists no job '${id}'`, 404);
    }

    const companiesRes = await db.query(
      `SELECT name, num_employees, description, logo_url 
        FROM companies 
        WHERE handle = $1`,
      [job.company_handle]
    );

    job.company = companiesRes.rows[0];

    return job;
  }

  static async create(data) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, title, salary, equity, company_handle`,
      [data.title, data.salary, data.equity, data.company_handle]
    );

    return result.rows[0];
  }

  static async update(id, data) {
    let { query, values } = sqlForPartialUpdate("jobs", data, "id", id);

    const result = await db.query(query, values);
    const job = result.rows[0];

    if (!job) {
      throw new ExpressError(`There exists no job '${id}`, 404);
    }

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs 
        WHERE id = $1 
        RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There exists no job '${id}`, 404);
    }
  }
}

module.exports = Job;