const { TableClient } = require('@azure/data-tables');

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const clientsCache = {};

async function getTableClient(tableName) {
  if (clientsCache[tableName]) return clientsCache[tableName];

  const client = TableClient.fromConnectionString(connStr, tableName);

  try {
    await client.createTable();
  } catch (err) {
    if (err.statusCode !== 409) throw err; // 409 = já existe
  }

  clientsCache[tableName] = client;
  return client;
}

module.exports = { getTableClient };