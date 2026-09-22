const PREFIX = process.env.PREFIX || 'pedrolacerda';

const TABLE_PREFIX = PREFIX.replace(/[^a-zA-Z0-9]/g, '');

module.exports = {
  PREFIX,
  TABLES: {
    PRODUTOS: `${TABLE_PREFIX}produtos`,
    CLIENTES: `${TABLE_PREFIX}clientes`,
    PEDIDOS: `${TABLE_PREFIX}pedidos`,
  },
  CONTAINERS: {
    IMAGENS: `${PREFIX}-imagens`,
  },
};