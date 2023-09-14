// Configuration
const config = require('./config');

const API_USER = config.conf.get('API_USER');
const API_PASSWORD = config.conf.get('API_PASSWORD');

// DB access
const db = require('./db');

// Basic Authentication - https://github.com/fastify/fastify-basic-auth
const auth = require('fastify-basic-auth');

function validate(username, password, req, reply, done) {
  if (username === 'anonymous' ||
      username !== API_USER ||
      password !== API_PASSWORD) {
    return done(new Error('Unauthorized'));
  }
  return done();
}

// define routes.
async function routes(fastify, options) {
  let dbConnected = false;
  fastify.register(auth, { validate });
  fastify.route({
    method: 'GET',
    url: '/health-check',
    handler: async function(req, reply, next) {
      return reply.send({message: 'ok'});
    }
  });
  fastify.route({
    method: 'GET',
    url: '/acronym',
    handler: async function(req, reply, next) {
      // https://github.com/fastify/fastify/blob/main/docs/Reference/Request.md
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
        reply.header('Link', `<${nextLink}>; rel="next"`);
      }

      return reply.send(results.rows);
    }
  });

  fastify.route({
    method: 'POST',
    url: '/acronym',
    handler: async function(req, reply, next) {
      const name = req.body?.name || null;
      const description = req.body?.description || null;
      // Validate name and description
      if (!name || !description) {
        reply.status(400);
        const message = name ? 'Missing "description"' : 'Missing "name"';
        return reply.send(message);
      }
      const result = await db.insertAcronym(name, description);
      return reply.send(result);
    }
  });

  fastify.after(() => {
    fastify.route({
      method: 'PUT',
      url: '/acronym/:acronym',
      onRequest: fastify.basicAuth,
      handler: async function(req, reply, next) {
        const newName = req.params.acronym || null;
        const oldName = req.body?.name || newName;
        const description = req.body?.description || null;
        // Validate name and description
        if (!newName || !description) {
          reply.status(400);
          if (!description) {
            return reply.send('Missing "name" parameter or body');
          } else {
            return reply.send('Missing "description" in body');
          }
        }

        const result = await db.upsertAcronym(oldName, newName, description);
        return reply.send(result);
      }
    });
    fastify.route({
      method: 'DELETE',
      url: '/acronym/:acronym',
      onRequest: fastify.basicAuth,
      handler: async function(req, reply, next) {
        const acronym = req.params?.acronym || null;
        if (!acronym) {
          reply.status(400);
          return reply.send('Missing parameter "acronym"');
        }
        const result = await db.deleteAcronym(acronym);
        return reply.send(result);
      }
    });
  });
}
module.exports = routes;
