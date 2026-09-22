const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getTableClient } = require('../services/tableService');
const { TABLES } = require('../config/azureConfig');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, endereco } = req.body;
    const client = await getTableClient(TABLES.CLIENTES);

    const entity = {
      partitionKey: 'cliente',
      rowKey: uuidv4(),
      nome,
      email,
      telefone: telefone || '',
      endereco: endereco || '',
      criadoEm: new Date().toISOString(),
    };

    await client.createEntity(entity);
    res.status(201).json(entity);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.CLIENTES);
    const clientes = [];
    for await (const entity of client.listEntities()) clientes.push(entity);
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/:rowKey', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.CLIENTES);
    const entity = await client.getEntity('cliente', req.params.rowKey);
    res.json(entity);
  } catch (err) {
    res.status(404).json({ erro: 'Cliente não encontrado' });
  }
});

router.put('/:rowKey', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.CLIENTES);
    const { nome, email, telefone, endereco } = req.body;

    const atualizado = {
      partitionKey: 'cliente',
      rowKey: req.params.rowKey,
      nome,
      email,
      telefone: telefone || '',
      endereco: endereco || '',
    };

    await client.updateEntity(atualizado, 'Merge');
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/:rowKey', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.CLIENTES);
    await client.deleteEntity('cliente', req.params.rowKey);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/:rowKey/pedidos', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PEDIDOS);
    const pedidos = [];

    for await (const entity of client.listEntities({
      queryOptions: { filter: `clienteId eq '${req.params.rowKey}'` },
    })) {
      pedidos.push(entity);
    }

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;