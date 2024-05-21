// Configuration
const config = require('./config');

// DB access
const db = require('./db');

// initialize REST API server errors
const errors = require('restify-errors');

// configuration for authenticated routes
const API_USER = config.conf.get('API_USER');
const API_PASSWORD = config.conf.get('API_PASSWORD');

function Health(req, res, next) {
  res.send({message: 'ok'});
  return next();
}

function Get(req, res, next) {
  const from = parseInt(req.query?.from || '0');
  const limit = parseInt(req.query?.limit || '10');
  const search = req.query?.search || '';
  let _count;

  return db.countAcronyms(from, search).then(count => {
    if (count && Array.isArray(count?.rows) && count.rows.length) {
      _count = count.rows[0].result_count;
      return db.getAcronyms(from, limit, search);
    } else {
      return null;
    }
  }).then(results => {
    if (!results || !Array.isArray(results?.rows) || !results.rows.length) {
      res.send([]);
      return next();
    }

    const nResults = results.rows.length;
    // Create Link header when there are more results
    if (nResults < _count) {
      const fromId = results.rows[nResults - 1].acronym_id;
      const nextLink = search ? `/acronym/?from=${fromId}&limit=${limit}&search=${search}` : `/acronym/?from=${fromId}&limit=${limit}`;
      res.link(nextLink, 'next');
    }

    res.send(results.rows);
    return next();
  }).catch(e => next(e));
}

function Post(req, res, next) {
  const name = req.body?.name || null;
  const description = req.body?.description || null;
  // Validate name and description
  if (!name || !description) {
    res.status(400);
    const message = name ? 'Missing "description"' : 'Missing "name"';
    res.send(message);
    return next();
  }
  return db.insertAcronym(name, description).then(result => {
    res.send(result);
    return next();
  }).catch(e => next(e));
}

function Put(req, res, next) {
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
  return db.upsertAcronym(oldName, newName, description).then(result => {
    res.send(result);
    return next();
  }).catch(e => next(e));
}
function Delete(req, res, next) {
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
  db.deleteAcronym(acronym).then(result => {
    res.send(result);
    return next();
  }).catch(e => next(e));
}

module.exports = {
  Health: Health,
  Get: Get,
  Post: Post,
  Put: Put,
  Delete: Delete
};
