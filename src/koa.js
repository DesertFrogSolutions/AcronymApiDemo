// logging - TODO
// const bunyan = require('bunyan');
// const log = bunyan.createLogger({name: appname});

// DB for close handler
const db = require('./db');

// Include routes for server
const routes = require('./routes.koa');

// include configuration
const config = require('./config');
// configuration for authorized routes
const API_USER = config.conf.get('API_USER');
const API_PASSWORD = config.conf.get('API_PASSWORD');

// initialize server - https://github.com/koajs/koa
const koa = require('koa');
const app = new koa();

// https://github.com/koajs/basic-auth
const auth = require('koa-basic-auth');
const authorizedRoutes = auth({ name: API_USER, pass: API_PASSWORD });

// TODO - this doesn't seem to work!
// https://github.com/koajs/router/blob/master/API.md
const Router = require('@koa/router');
const router = new Router();

// https://github.com/koajs/koa-body
const bodyParser = require('koa-body')();

router.get('/health-check', routes.Health)
  .get('get-acronym', '/acronym', routes.Get)
  .del('del-acronym', '/acronym/:acronym', authorizedRoutes, routes.Delete)
  .post('post-acronym', '/acronym', bodyParser, routes.Post)
  .put('put-acronym', '/acronym/:acronym', authorizedRoutes, bodyParser, routes.Put);

// error handling & logging
app.use(
  router.routes(),
  router.allowedMethods(),
  async (ctx, next) => {
    // const start = new Date();
    try {
      // console.log(ctx);
      await next();
      // console.log(ctx);
      // const ms = new Date() - start;
      // console.log(`${ctx.method} ${ctx.url} (${ctx._matchedRoute})- ${ms}ms`);
    } catch (err) {
      // console.log(err);
      // console.log(ctx);
      // // will only respond with JSON
      ctx.status = err.statusCode || err.status || 500;
      ctx.body = {
        message: err.message
      };
      // console.log(ctx);
      // const ms = new Date() - start;
      // console.log(`${ctx.method} ${ctx.url} (${ctx._matchedRoute})- ${ms}ms`);
    }
  }
);


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
app.on('uncaughtException', handleError);

const PORT = config.conf.get('PORT');
const server = app.listen(parseInt(PORT));
console.log('Server listening at %d', PORT);

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
db.pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  return server.close();
});

module.exports = server;
