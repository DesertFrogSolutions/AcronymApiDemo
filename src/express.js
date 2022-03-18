// application name
// const appname = 'acronymapi';

// logging (TODO)
// const bunyan = require('bunyan');
// const log = bunyan.createLogger({name: appname});

// DB for close handler
const db = require('./db');

// Include routes for server
const routes = require('./routes.express');

// include configuration
const config = require('./config');

// initialize server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// https://www.npmjs.com/package/express-basic-auth
const basicAuth = require('express-basic-auth');

const API_USER = config.conf.get('API_USER');
const API_PASSWORD = config.conf.get('API_PASSWORD');

const authUsers = {};
authUsers[API_USER] = API_PASSWORD;
const authorizedRouteMiddleware = basicAuth({users: authUsers});

app.get('/health-check', routes.Health);
app.get('/acronym', routes.Get);
app.delete('/acronym/:acronym', authorizedRouteMiddleware, routes.Delete);

// http://expressjs.com/en/resources/middleware/body-parser.html
// parse application/json
app.post('/acronym', bodyParser.json(), routes.Post);
app.put('/acronym/:acronym', authorizedRouteMiddleware, bodyParser.json(), routes.Put);

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
app.on('close', doClose);

// error handling
function handleError(err, req, res, callback) {
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
app.use(handleError);
// uncaught exceptions in middleware
app.on('uncaughtException', (req, res, err, callback) => handleError(err, req, res, callback));

const PORT = parseInt(config.conf.get('PORT'));
const server = app.listen({port: PORT}, function() {
  console.log('Server "%s" listening at %d', app.name, PORT);
});
process.on('SIGINT', doClose);
process.on('exit', doClose);

module.exports = server;
