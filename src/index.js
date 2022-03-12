// application name
const appname = 'acronymapi';

// logging
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: appname});

// Include routes for server
const routes = require('./routes');

// include configuration
const config = require('./config');

// initialize server
const restify = require('restify');
const server = restify.createServer({
  name: appname,
  log: log
});


server.pre(restify.plugins.requestLogger({
    log: log,
    serializers: restify.bunyan.serializers
}));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.authorizationParser());

server.get('/acronym', routes.Get);
server.del('/acronym/:acronym', routes.Delete);

server.use(restify.plugins.bodyParser());
server.post('/acronym', routes.Post);
server.put('/acronym/:acronym', routes.Put);

server.listen(parseInt(config.conf.get('PORT')), function() {
  console.log('%s listening at %s', server.name, server.url);
});

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
  return callback(message);
}
// uncaught exceptions in middleware
server.on('uncaughtException', handleError);
// any other error (fallthru)
server.on('restifyError', handleError);

module.exports = server;
