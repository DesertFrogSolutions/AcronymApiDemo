// configuration
const config = require('./config');
// DB access
const { Pool } = require('pg');
const pool = new Pool({
  host: config.conf.get('PGHOST'),
  user: config.conf.get('PGUSER'),
  password: config.conf.get('PGPASSWORD'),
  database: config.conf.get('PGDATABASE'),
  port: parseInt(config.conf.get('PGPORT'))
});


const COLUMNS = {
  acronym_id: 'acronym_id',
  name: 'name',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
}
const COLUMNS_STR = Object.entries(COLUMNS).map(([key, value]) => {return value;}).join(',');

const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};
const connect = () => {
  return pool.connect();
};

let db_connected = false;

// DB access layer
async function countAcronyms(from, search = '') {
  if (!db_connected) {
    await connect();
    db_connected = true;
  }
  const count_search_query = {
    name: 'get-acronyms-count-search',
    text: `WITH matches AS (SELECT acronym_id FROM acronym WHERE acronym_id >= $1 AND (lower(name) LIKE $2 OR lower(description) LIKE $2) ORDER BY acronym_id ASC) SELECT COUNT(*) as result_count FROM matches`,
    values: [from, `%${search.toLowerCase()}%`]
  };
  const count_empty_query = {
    name: 'get-acronyms-count-empty',
    text: `WITH matches AS (SELECT acronym_id FROM acronym WHERE acronym_id >= $1 ORDER BY acronym_id ASC) SELECT COUNT(*) as result_count FROM matches`,
    values: [from]
  };
  if (search) {
    return await query(count_search_query);
  } else {
    return await query(count_empty_query);
  }
}

async function getAcronyms(from, limit, search = '')  {
  if (!db_connected) {
    await connect();
    db_connected = true;
  }
  const result_search_query = {
    name: 'get-acronyms-search',
    text: `SELECT ${COLUMNS_STR} FROM acronym WHERE acronym_id >= $1 AND (lower(name) LIKE $3 OR lower(description) LIKE $3) ORDER BY acronym_id ASC LIMIT $2`,
    values: [from, limit, `%${search.toLowerCase()}%`]
  };

  const result_empty_query = {
    name: 'get-acronyms-empty',
    text: `SELECT ${COLUMNS_STR} FROM acronym WHERE acronym_id >= $1 ORDER BY acronym_id ASC LIMIT $2`,
    values: [from, limit]
  };
  if (search) {
    return await query(result_search_query);
  } else {
    return await query(result_empty_query);
  }
}

async function insertAcronym(name, description) {
  if (!db_connected) {
    await connect();
    db_connected = true;
  }
  const insert_query = {
    name: 'insert-acronym-only',
    text: `INSERT INTO acronym (name, description) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    values: [name, description]
  };
  return await query(insert_query);
}
async function upsertAcronym(oldName, newName, description) {
  if (!db_connected) {
    await connect();
    db_connected = true;
  }
  // NOTE - names are not unique. How should we disambiguate cases?
  const upsert_query = {
    name: 'upsert-acronym-only',
    text: `WITH upsert AS (UPDATE acronym SET name=$3, description=$2 WHERE name = $1 RETURNING name) INSERT INTO acronym (name, description) SELECT $3, $2 WHERE NOT EXISTS (SELECT 1 FROM upsert)`,
    values: [oldName, description, newName]
  };
  return await query(upsert_query);
}
async function deleteAcronym(name) {
  if (!db_connected) {
    await connect();
    db_connected = true;
  }
  const delete_query = {
    name: 'delete-acronym',
    text: 'DELETE FROM acronym WHERE name=$1',
    values: [name]
  };
  return await query(delete_query);
}
module.exports = {
  countAcronyms: countAcronyms,
  getAcronyms: getAcronyms,
  insertAcronym: insertAcronym,
  upsertAcronym: upsertAcronym,
  deleteAcronym: deleteAcronym,
  end: () => {
    try {
      return pool.end();
    } catch (err) {
      console.log('Error ending pool: ', err);
      return null;
    }
  },
  pool: pool
};
