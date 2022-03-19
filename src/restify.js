// application name
const appname = 'acronymapi';

// logging
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: appname, serializers: {req: bunyan.stdSerializers.req}});
const auditLog = bunyan.createLogger({name: appname + ':audit', serializers: {res: bunyan.stdSerializers.res}});
// DB for close handler
const db = require('./db');

// Include routes for server
const routes = require('./routes.restify');

// include configuration
const config = require('./config');
const _DEBUG = config.conf.get('DEBUG');
const DEBUG = (!!_DEBUG && _DEBUG === 'true');

// initialize server
const restify = require('restify');
const server = restify.createServer({
  name: appname,
  log: log
});


server.pre(restify.plugins.requestLogger({
    log: log,
}));
if (DEBUG) {
  // set up logging for every request
  server.pre(function (request, response, next) {
    request.log.info({ req: request }, 'REQUEST');
    next();
  });
  // set up audit logging
  server.on('after', restify.plugins.auditLogger({
    log: auditLog,
    event: 'after',
    server: server
  }));
}

server.use(restify.plugins.queryParser());
server.use(restify.plugins.authorizationParser());

server.get('/health-check', routes.Health);
server.get('/acronym', routes.Get);
server.del('/acronym/:acronym', routes.Delete);

server.use(restify.plugins.bodyParser());
server.post('/acronym', routes.Post);
server.put('/acronym/:acronym', routes.Put);

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
db.pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  return server.close();
});

// cleanup on server close
function doClose() {
  console.log('Closing pool.');
  return db.end().then((e) => {
    console.log('Closed', e);
    process.exit(0);
  });
}
server.on('close', doClose);

// error handling
function handleError(req, res, err, callback) {
  if (!err) {
    return null;
  }
  console.log(err); // log the error
  let message = 'Uncaught Exception';
  if ('message' in err) {
    message = err.message;
  }
  if (res.headersSent) {
    // This could happen when a protocol error occurs when an error occurs
    // after the headers have been received (and forwarded). Do not write
    // the headers because it would generate an error.
    // Prior to Node 13.x, the stream would have ended.
    // As of Node 13.x, we must explicitly close it.
    if (res.writableEnded === false) {
      res.end();
    }
    return callback(message);
  }
  return callback(message);
}
// uncaught exceptions in middleware
server.on('uncaughtException', handleError);
// any other error (fallthru)
server.on('restifyError', handleError);

// run server if used as a module on the command line
if (require.main === module) {
  server.listen(parseInt(config.conf.get('PORT')), function() {
    console.log('%s listening at %s', server.name, server.url);
  });

  process.on('SIGINT', doClose);
  process.on('exit', doClose);

}

module.exports = server;
