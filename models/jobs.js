const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {
  
  static async getAll(q) {
    let query = `SELECT id, title, company_handle FROM jobs`;
    let where = [];
    let value = [];

    if (q.min_salary) {
      value.push(+q.min_salary);
      where.push(`min_salary >= $${value.length}`)
    }
    if (q.min_equity) {
      value.push(+q.min_equity);
      where.push(`min_equity >= $${value.length}`)
    }
    if (q.search) {
      value.push(`%${q.search}%`)
      where.push(`title ILIKE $${value.length}`)
    }
    if (whereExpressions.length > 0) {
      baseQuery += " WHERE ";
    }

    let finalQuery = query + where.join(" AND ") + "GROUP BY company_handle";
    const result = await db.query(finalQuery, value);
    return result.rows;
  }

  static async getOne(id) {
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle FROM jobs WHERE id=$1
    `, [id])

    if (!result.row[0]) {
      throw new ExpressError(`${id} doesn't exist`, 404)
    }

    return result.rows[0];
  }

  static async addJob(data) {
    const result = await db.query(`
      INSERT INTO jobs (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4) RETURNING id, title, salary, equity, company_handle
    `, [data.title, data.salary, data.equity, data.company_handle])

    return result.rows[0]
  }

  static async updateJob(id, data) {
    let { query, values } = sqlForPartialUpdate("jobs", data, "id", id);

    const result = await db.query(query, values);

    if (!result.rows[0]) {
      throw new ExpressError(`There exists no job '${id}`, 404);
    }

    return job;
  }

  static async deleteJob(id) {
    const result = await db.query(`
      DELETE FROM jobs WHERE id=$1 RETURNING id
    `, [id])
    if (!result.rows) {
      throw new ExpressError(`${id} doesn't exist`, 404)
    }
  }

}