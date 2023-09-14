// Configuration
const config = require('./config');

// DB access
const db = require('./db');

const API_USER = config.conf.get('API_USER');
const API_PASSWORD = config.conf.get('API_PASSWORD');
const messageOk = JSON.stringify({message: 'ok'});

async function Health(req, res) {
  return res.write(messageOk, 'utf-8');
}

async function Get(req, res) {
  const from = parseInt(req.searchParams.get('from') || '0');
  const limit = parseInt(req.searchParams.get('limit') || '10');
  const search = req.searchParams.get('search') || '';
  // console.log('GET');
  const count = await db.countAcronyms(from, search);
  const results = await db.getAcronyms(from, limit, search);

  // Create Link header when there are more results
  const nResults = results.rows.length;
  if (nResults < count.rows[0].result_count) {
    const fromId = results.rows[nResults - 1].acronym_id;
    const nextLink = search ? `/acronym/?from=${fromId}&limit=${limit}&search=${search}` : `/acronym/?from=${fromId}&limit=${limit}`;
    res.setHeader('Link', `<${nextLink}>; rel="next"`);
  }

  return res.write(JSON.stringify(results.rows), 'utf-8');
}

async function Post(req, res) {
  const name = req.parsedBody?.name;
  const description = req.parsedBody?.description;
  // console.log('POST');
  // Validate name and description
  if (!name || !description) {
    res.statusCode = 400;
    const message = name ? 'Missing "description"' : 'Missing "name"';
    return res.write(JSON.stringify({message: message}), 'utf-8');
  }
  const result = await db.insertAcronym(name, description);
  return res.write(JSON.stringify(result));
}

async function Put(req, res) {
  // check if user passed valid authentication header
  // console.log('PUT');
  if (req.username === 'anonymous' ||
    req.username !== API_USER ||
    req.password !== API_PASSWORD) {
    res.statusCode = 401;
    return res.write(JSON.stringify({message: 'Unauthorized'}), 'utf-8');
  }
  const newName = req.params.acronym;
  const oldName = req.parsedBody.name || newName;
  const description = req.parsedBody?.description;
  // Validate name and description
  if (!newName || !description) {
    res.statusCode = 400;
    if (!description) {
      return res.write(JSON.stringify({message: 'Missing "name" parameter or body'}), 'utf-8');
    } else {
      return res.write(JSON.stringify({message: 'Missing "description" in body'}), 'utf-8');
    }
  }

  const result = await db.upsertAcronym(oldName, newName, description);
  return res.write(JSON.stringify(result));
}
async function Delete(req, res) {
  // console.log('DELETE');
  // check if user passed valid authentication header
  if (req.username === 'anonymous' ||
    req.username !== API_USER ||
    req.password !== API_PASSWORD) {
    res.statusCode = 401;
    return res.write(JSON.stringify({message: 'Unauthorized'}), 'utf-8');
  }
  const acronym = req.params?.acronym || null;
  if (!acronym) {
    res.statusCode = 400;
    return res.write(JSON.stringify({message: 'Missing parameter "acronym"'}), 'utf-8');
  }
  const result = await db.deleteAcronym(acronym);
  return res.write(JSON.stringify(result), 'utf-8');
}

module.exports = {
  Health: Health,
  Get: Get,
  Post: Post,
  Put: Put,
  Delete: Delete
};
