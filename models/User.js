const db = require("../db");
const bcrypt = require("bcrypt");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/ExpressError");

const BCRYPT_WORK_FACTOR = 10;

class User {

  static async authenticate(data) {
    // find user by username
    const result = await db.query(`
      SELECT username, password, first_name ,last_name ,email ,photo_url ,is_admin
      FROM users 
      WHERE username = $1
      `, [data.username]);

    const user = result.rows[0];
    // if user exists check correct password
    if (user) {
      const isValid = await bcrypt.compare(data.password, user.password);
      if (isValid) {
        return user;
      }
    }

    throw new ExpressError("Invalid Password", 401);
  }

  static async register(data) {
    // check for existing user with username
    const duplicateCheck = await db.query(
      `SELECT username 
        FROM users 
        WHERE username = $1`,
      [data.username]
    );
    // if username already exists throw error
    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a user with username '${data.username}`,
        400
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    // register user
    const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, email, photo_url) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING username, password, first_name, last_name, email, photo_url`
      , [data.username, hashedPassword, data.first_name, data.last_name, data.email, data.photo_url]);

    return result.rows[0];
  }

  static async findAll() {
    // return all users ordered by username
    const result = await db.query(`
      SELECT username, first_name, last_name, email
      FROM users
      ORDER BY username
    `);

    return result.rows;
  }

  static async findOne(username) {
    // find a user by username
    const userRes = await db.query(`
      SELECT username, first_name, last_name, photo_url, email
      FROM users 
      WHERE username = $1`,
      [username]);

    const user = userRes.rows[0];
    // if no user with username throw error
    if (!user) {
      throw new ExpressError(`There exists no user '${username}'`, 404);
    }

    return user;
  }

  static async update(username, data) {
    // update a user
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    
    let { query, values } = partialUpdate("users", data, "username", username);

    const result = await db.query(query, values);
    const user = result.rows[0];

    if (!user) {
      throw new ExpressError(`There exists no user '${username}'`, 404);
    }

    delete user.password;
    delete user.is_admin;

    return result.rows[0];
  }

  static async remove(username) {
    // delete user by username
    let result = await db.query(
      `DELETE FROM users 
        WHERE username = $1
        RETURNING username`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There exists no user '${username}'`, 404);
    }
  }
}

module.exports = User;