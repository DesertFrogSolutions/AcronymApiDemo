// Configuration
const config = require('./config');

// DB access
const db = require('./db');

// initialize REST API server
const errors = require('restify-errors');

let dbConnected = false;

const API_USER = config.conf.get('API_USER');
const API_PASSWORD = config.conf.get('API_PASSWORD');

async function Get(req, res, next) {
  try {
    const from = parseInt(req.query?.from || '0');
    const limit = parseInt(req.query?.limit || '10');
    const search = req.query?.search || '';

    const count = await db.countAcronyms(from, search);
    const results = await db.getAcronyms(from, limit, search);

    // Create Link header when there are more results
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
    const name = req.body?.name || null;
    const description = req.body?.description || null;
    // Validate name and description
    if (!name || !description) {
      res.status(400);
      const message = name ? 'Missing "description"' : 'Missing "name"';
      res.send(message);
      return next();
    }
    const result = await db.insertAcronym(name, description);
    res.send(result);
    return next();
  } catch (err) {
    return next(err);
  }
}

async function Put(req, res, next) {
  try {
    // check if user passed valid authentication header
    if (req.username === 'anonymous' ||
        req.username !== API_USER ||
        req.authorization.basic.password !== API_PASSWORD) {
      return next(new errors.UnauthorizedError());
    }
    const newName = req.params.acronym || null;
    const oldName = req.body?.name || newName;
    const description = req.body?.description || null;
    // Validate name and description
    if (!newName || !description) {
      res.status(400);
      if (!description) {
        res.send('Missing "name" parameter or body');
      } else {
        res.send('Missing "description" in body');
      }
      return next();
    }

    const result = await db.upsertAcronym(oldName, newName, description);
    res.send(result);
    return next();
  } catch (err) {
    next(err);
  }
}
async function Delete(req, res, next) {
  try {
    // check if user passed valid authentication header
    if (req.username === 'anonymous' ||
        req.username !== API_USER ||
        req.authorization.basic.password !== API_PASSWORD) {
      return next(new errors.UnauthorizedError());
    }
    const acronym = req.params?.acronym || null;
    if (!acronym) {
      res.status(400);
      res.send('Missing parameter "acronym"');
      return next();
    }
    const result = await db.deleteAcronym(acronym);
    res.send(result);
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
