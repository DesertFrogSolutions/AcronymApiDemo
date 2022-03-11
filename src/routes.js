const db = require('./db');

// initialize REST API server
const errors = require('restify-errors');

console.log(db.COLUMNS_STR);

let dbConnected = false;

const API_USER = process.env.API_USER || 'username';
const API_PASSWORD = process.env.API_PASSWORD || 'password';

async function Get(req, res, next) {
  try {
    if (!dbConnected) {
      await db.connect();
      dbConnected = true;
    }
    const from = parseInt(req.query?.from || '0');
    const limit = parseInt(req.query?.limit || '10');
    const search = req.query?.search || null;

    const count_query = {
      name: 'get-acronyms-count',
      text: '',
      values: [from]
    };
    const result_query = {
      name: 'get-acronyms',
      text: '',
      values: [from, limit]
    };
    if (search) {
      result_query.text = `SELECT ${db.COLUMNS_STR} FROM acronym WHERE acronym_id >= $1 AND (lower(name) LIKE '%$3%' OR lower(description) LIKE '%$3%') ORDER BY acronym_id ASC LIMIT $2`;
      result_query.values.push(search.toLowerCase());
      count_query.text = `SELECT COUNT(acronym_id) as result_count FROM acronym WHERE acronym_id >= $1 AND (lower(name) LIKE '%$2%' OR lower(description) LIKE '%$2%') GROUP BY acronym_id ORDER BY acronym_id ASC`;
      count_query.values.push(search.toLowerCase());
    } else {
      result_query.text = `SELECT ${db.COLUMNS_STR} FROM acronym WHERE acronym_id >= $1 ORDER BY acronym_id ASC LIMIT $2`;
      count_query.text = `SELECT COUNT(acronym_id) as result_count FROM acronym WHERE acronym_id >= $1 GROUP BY acronym_id ORDER BY acronym_id ASC`;
    }
    const count = await db.query(count_query);
    console.log(count);
    const results = await db.query(result_query);
    console.log(results);
    const nResults = results.rows.length;
    if (nResults < count.rows[0].result_count) {
      const fromId = results.rows[nResults - 1].acronym_id;
      const nextLink = search ? `/acronym/?from=${fromId}&limit=${limit}&search=${search}` : `/acronym/?from=${fromId}&limit=${limit}`;
      res.link(nextLink, 'next');
    }
    res.send(results.rows);
    return next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
}

async function Post(req, res, next) {
  try {
    if (!dbConnected) {
      await db.connect();
      dbConnected = true;
    }
    // console.log(req);
    res.send('testing');
    return next();
  } catch (err) {
    return next(err);
  }
}

async function Put(req, res, next) {
  try {
    if (!dbConnected) {
      await db.connect();
      dbConnected = true;
    }
    // check if user passed valid authentication header
    if (req.username === 'anonymous' ||
        req.username !== API_USER ||
        req.authorization.basic.password !== API_PASSWORD) {
      return next(new errors.UnauthorizedError());
    }
    res.send('testing');
    return next();
  } catch (err) {
    next(err);
  }
}
async function Delete(req, res, next) {
  try {
    if (!dbConnected) {
      await db.connect();
      dbConnected = true;
    }
    // check if user passed valid authentication header
    if (req.username === 'anonymous' ||
        req.username !== API_USER ||
        req.authorization.basic.password !== API_PASSWORD) {
      return next(new errors.UnauthorizedError());
    }
    // console.log(req);
    res.send('testing');
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  Get: Get,
  Post: Post,
  Put: Put,
  Delete: Delete
};
