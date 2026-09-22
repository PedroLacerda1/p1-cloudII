const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getTableClient } = require('../services/tableService');
const { TABLES } = require('../config/azureConfig');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { clienteId, itens, metodoPagamento, metodoEntrega } = req.body;

    if (!clienteId || !itens || !itens.length || !metodoPagamento || !metodoEntrega) {
      return res.status(400).json({ erro: 'Dados incompletos para o checkout' });
    }

    const produtosClient = await getTableClient(TABLES.PRODUTOS);
    let total = 0;
    const itensValidados = [];

    for (const item of itens) {
      let produto;
      try {
        produto = await produtosClient.getEntity('produto', item.produtoId);
      } catch {
        return res.status(400).json({ erro: `Produto ${item.produtoId} não encontrado` });
      }

      if (item.quantidade <= 0) {
        return res.status(400).json({ erro: 'Quantidade inválida' });
      }
      if (produto.quantidade < item.quantidade) {
        return res.status(400).json({
          erro: `Estoque insuficiente para ${produto.marca} ${produto.modelo} (disponível: ${produto.quantidade})`,
        });
      }

      total += produto.valor * item.quantidade;
      itensValidados.push({
        produtoId: item.produtoId,
        marca: produto.marca,
        modelo: produto.modelo,
        valorUnitario: produto.valor,
        quantidade: item.quantidade,
      });
    }

    for (const item of itensValidados) {
      const produtoAtual = await produtosClient.getEntity('produto', item.produtoId);
      await produtosClient.updateEntity(
        {
          partitionKey: 'produto',
          rowKey: item.produtoId,
          quantidade: produtoAtual.quantidade - item.quantidade,
        },
        'Merge'
      );
    }

    const pedidosClient = await getTableClient(TABLES.PEDIDOS);
    const pedido = {
      partitionKey: 'pedido',
      rowKey: uuidv4(),
      clienteId,
      itens: JSON.stringify(itensValidados),
      total,
      metodoPagamento,
      metodoEntrega,
      status: 'confirmado',
      criadoEm: new Date().toISOString(),
    };

    await pedidosClient.createEntity(pedido);
    res.status(201).json({ ...pedido, itens: itensValidados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PEDIDOS);
    const pedidos = [];
    for await (const entity of client.listEntities()) {
      pedidos.push({ ...entity, itens: JSON.parse(entity.itens) });
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get('/:rowKey', async (req, res) => {
  try {
    const client = await getTableClient(TABLES.PEDIDOS);
    const entity = await client.getEntity('pedido', req.params.rowKey);
    entity.itens = JSON.parse(entity.itens);
    res.json(entity);
  } catch (err) {
    res.status(404).json({ erro: 'Pedido não encontrado' });
  }
});

module.exports = router;