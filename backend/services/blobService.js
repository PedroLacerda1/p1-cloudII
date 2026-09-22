const { BlobServiceClient } = require('@azure/storage-blob');

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

async function getContainerClient(containerName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists({ access: 'blob' });
  return containerClient;
}

async function uploadImage(containerName, file) {
  const containerClient = await getContainerClient(containerName);
  const blobName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return blockBlobClient.url;
}

module.exports = { getContainerClient, uploadImage };