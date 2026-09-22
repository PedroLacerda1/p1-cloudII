const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getTableClient } = require('../services/tableService');
const { uploadImage } = require('../services/blobService');
const { TABLES, CONTAINERS } = require('../config/azureConfig');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { marca, modelo, valor, quantidade } = req.body;
    let fotoUrl = '';

    if (req.file) {
      fotoUrl = await uploadImage(CONTAINERS.IMAGENS, req.file);
    }

    const client = await getTableClient(TABLES.PRODUTOS);
    const entity = {
      partitionKey: 'produto',
      rowKey: uuidv4(),
      marca,
      modelo,
      valor: parseFloat(valor),
      quantidade: parseInt(quantidade, 10),
      fotoUrl,
      criadoEm: new Date().toISOString(),
    };

    await client.createEntity(entity);
    res.status(201).json(entity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PRODUTOS);
    const { marca, modelo, precoMin, precoMax } = req.query;
    const produtos = [];

    for await (const entity of client.listEntities()) {
      if (marca && !entity.marca?.toLowerCase().includes(marca.toLowerCase())) continue;
      if (modelo && !entity.modelo?.toLowerCase().includes(modelo.toLowerCase())) continue;
      if (precoMin && entity.valor < parseFloat(precoMin)) continue;
      if (precoMax && entity.valor > parseFloat(precoMax)) continue;
      produtos.push(entity);
    }

    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/:rowKey', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PRODUTOS);
    const entity = await client.getEntity('produto', req.params.rowKey);
    res.json(entity);
  } catch (err) {
    res.status(404).json({ erro: 'Produto não encontrado' });
  }
});

router.put('/:rowKey', upload.single('foto'), async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PRODUTOS);
    const existente = await client.getEntity('produto', req.params.rowKey);
    const { marca, modelo, valor, quantidade } = req.body;

    let fotoUrl = existente.fotoUrl;
    if (req.file) {
      fotoUrl = await uploadImage(CONTAINERS.IMAGENS, req.file);
    }

    const atualizado = {
      partitionKey: 'produto',
      rowKey: req.params.rowKey,
      marca: marca || existente.marca,
      modelo: modelo || existente.modelo,
      valor: valor ? parseFloat(valor) : existente.valor,
      quantidade: quantidade !== undefined ? parseInt(quantidade, 10) : existente.quantidade,
      fotoUrl,
    };

    await client.updateEntity(atualizado, 'Merge');
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:rowKey', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PRODUTOS);
    await client.deleteEntity('produto', req.params.rowKey);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;