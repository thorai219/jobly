const db = require("../db");
const bcrypt = require('bcrypt');
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

const SALT_ROUNDS = 10;

class User {

  static async authenticate(data) {
    // find the user with provided username
    const result = await db.query(`
      SELECT username, password, first_name, last_name, email, photo_url, is_admin
      FROM users WHERE username = $1
    `, [data.username])

    if (result.rows[0]) {
      // if password is valid return the user
      const valid = await bcrypt.compare(data.password, result.rows[0].password)
      if (valid) {
        return result.rows[0];
      }
    }
    // else throw error
    throw new ExpressError(`Invalid password`, 401)
  }

  static async signup(data) {
    const duplicateCheck = await db.query(`
      SELECT username FROM users WHERE username = $1`, [data.username]
    );

    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a user with username '${data.username}`,
        400
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO users 
          (username, password, first_name, last_name, email, photo_url) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING username, password, first_name, last_name, email, photo_url`,
      [
        data.username,
        hashedPassword,
        data.first_name,
        data.last_name,
        data.email,
        data.photo_url
      ]
    );

    return result.rows[0];
  }

  static async getAll() {
    // find all users in db
    const result = await db.query(`
      SELECT username, first_name, last_name, email FROM users ORDER BY username
    `)
    return result.rows;
  }

  static async getOne(username) {
    // find one user with username
    const result = await db.query(`
      SELECT username, first_name, last_name, email, photo_url FROM users WHERE username = $1
    `, [username])

    return result.rows[0];
  }

  static async updateUser(username, data) {
    // update existing user profile
    // check if password matches
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    // user helper function for partially updating a user porfile
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

  static async deleteUser(username) {
    // delete a user 
    const result = await db.query(`
      DELETE FROM users WHERE username = $1
    `, [username])

    if (!result.rows) {
      throw new ExpressError(`${username} doesn't exist`, 404)
    }
  }
}

module.exports = User;