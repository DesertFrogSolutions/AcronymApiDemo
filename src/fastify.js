// application name
const appname = 'acronymapi';

// DB for close handler
const db = require('./db');

// Include routes for server
const routes = require('./routes.fastify');

// include configuration
const config = require('./config');
const _DEBUG = config.conf.get('DEBUG');
const DEBUG = (!!_DEBUG && _DEBUG === 'true');

// initialize server
const fastify = require('fastify')({logger: DEBUG});
fastify.register(routes);

// cleanup on server close
fastify.addHook('onClose', (instance, done) => {
  console.log('Closing pool.');
  return db.end().then((e) => {
    console.log('Closed', e);
    process.exit(0);
    return done();
  });
});

// error handling
function handleError(err, request, reply) {
  if (!err) {
    return null;
  }
  console.log(err); // log the error
  let message = 'Uncaught Exception';
  if ('message' in err) {
    message = err.message;
  }
  if (err.statusCode === 401) {
    return reply.status(401).send(message);
  } else {
    return reply.status(409).send(message);
  }
}
// uncaught exceptions in middleware
fastify.setErrorHandler(handleError);

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
db.pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  return fastify.close();
});


if (require.main === module) {
  // https://github.com/fastify/fastify/blob/main/docs/Guides/Getting-Started.md
  fastify.listen(parseInt(config.conf.get('PORT')), function(err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('listening at %s', address);
  });
}

module.exports = fastify;
