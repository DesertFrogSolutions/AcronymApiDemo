// https://www.npmjs.com/package/nconf
const nconf = require('nconf');

// first in priority: command line arguments, then environment variables
nconf.argv().env();

nconf.defaults({
  PORT: '8080',
  PGUSER: 'acronymapi',
  PGPASSWORD: 'password',
  PGDATABASE: 'defaultdb',
  PGHOST: 'localhost',
  PGPORT: '5432',
  API_USER: 'username',
  API_PASSWORD: 'password'
});
module.exports = {
  conf: nconf
};
