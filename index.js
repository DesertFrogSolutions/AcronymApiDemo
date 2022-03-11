// logging
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: "acronym"});

// DB access
const { Pool } = require('pg');
const pool = new Pool();

// initialize REST API server
const restify = require('restify');
const server = restify.createServer({
  name: 'acronymapi',
  log: log
});

let dbConnected = false;
// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  server.close(() => {
    console.log('Server closed');
  });
});

const APIUser = process.env.API_USER || 'username';
const APIPassword = process.env.API_PASSWORD || 'password';

async function doGet(req, res, next) {
  try {
    if (!dbConnected) {
      await pool.connect();
      dbConnected = true;
    }
    const from = parseInt(req.query?.from || '0');
    const limit = parseInt(req.query?.limit || '10');
    const search = req.query?.search || null;
    console.log(from, limit, search);
    res.send('testing');
    return next();
  } catch (err) {
    console.log(err);
    return next(err);
  }
}

async function doPost(req, res, next) {
  try {
    if (!dbConnected) {
      await pool.connect();
      dbConnected = true;
    }
    console.log(req);
    res.send('testing');
    return next();
  } catch (err) {
    return next(err);
  }
}

async function doPut(req, res, next) {
  try {
    if (!dbConnected) {
      await pool.connect();
      dbConnected = true;
    }
    console.log(req);
    res.send('testing');
    return next();
  } catch (err) {
    next(err);
  }
}
async function doDelete(req, res, next) {
  try {
    if (!dbConnected) {
      await pool.connect();
      dbConnected = true;
    }
    console.log(req);
    res.send('testing');
    return next();
  } catch (err) {
    return next(err);
  }
}

server.pre(restify.plugins.requestLogger({
    log: log,
    serializers: restify.bunyan.serializers
}));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.authorizationParser());

server.get('/acronym', doGet);
server.del('/acronym/:acronym', doDelete);

server.use(restify.plugins.bodyParser());
server.post('/acronym', doPost);
server.put('/acronym/:acronym', doPut);

server.listen(process.env.PORT || 8080, function() {
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
