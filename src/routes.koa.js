// DB access
const db = require('./db');

function Health(ctx) {
  ctx.body = { message: 'ok' };
  ctx.status = 200;
  return;
}

async function Get(ctx) {
  const from = parseInt(ctx.request.query?.from || '0');
  const limit = parseInt(ctx.request.query?.limit || '10');
  const search = ctx.request.query?.search || '';

  const count = await db.countAcronyms(from, search);
  const results = await db.getAcronyms(from, limit, search);
  // Create Link header when there are more results
  const nResults = results.rows.length;
  if (nResults < count.rows[0].result_count) {
    const fromId = results.rows[nResults - 1].acronym_id;
    const nextLink = search ? `/acronym/?from=${fromId}&limit=${limit}&search=${search}` : `/acronym/?from=${fromId}&limit=${limit}`;
    ctx.set('Link', `<${nextLink}>; rel="next"`);
  }

  ctx.body = results.rows;
  ctx.status = 200;
}

async function Post(ctx) {
  // console.log(ctx);
  // console.log(ctx.request.body);
  const name = ctx.request.body?.name || null;
  const description = ctx.request.body?.description || null;
  // Validate name and description
  if (!name || !description) {
    ctx.response.status = 400;
    const message = name ? 'Missing "description"' : 'Missing "name"';
    ctx.body = message;
    return;
  }
  const result = await db.insertAcronym(name, description);
  // console.log(result);
  ctx.body = result;
  ctx.status = 200;
}

async function Put(ctx) {
  // console.log(ctx.request.body);
  // console.log(ctx.params);
  const newName = ctx.params.acronym || null;
  const oldName = ctx.request.body?.name || newName;
  const description = ctx.request.body?.description || null;
  // Validate name and description
  if (!newName || !description) {
    ctx.status = 400;
    if (!description) {
      ctx.body = 'Missing "name" parameter or body';
    } else {
      ctx.body = 'Missing "description" in body';
    }
    return;
  }

  const result = await db.upsertAcronym(oldName, newName, description);
  ctx.body = result;
  ctx.status = 200;
}
async function Delete(ctx) {
  const acronym = ctx.params?.acronym || null;
  if (!acronym) {
    ctx.status = 400;
    ctx.body = 'Missing parameter "acronym"';
    return;
  }
  const result = await db.deleteAcronym(acronym);
  ctx.body = result;
  ctx.status = 200;
}

module.exports = {
  Health: Health,
  Get: Get,
  Post: Post,
  Put: Put,
  Delete: Delete
};
