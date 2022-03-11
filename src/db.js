// DB access
const { Pool } = require('pg');
const pool = new Pool();

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  server.close(() => {
    console.log('Server closed');
  });
});

const COLUMNS = {
  acronym_id: 'acronym_id',
  name: 'name',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
}
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
  connect: () => {
    return pool.connect();
  },
  COLUMNS: COLUMNS,
  COLUMNS_STR: Object.entries(COLUMNS).map(([key, value]) => {return value;}).join(',')
};
