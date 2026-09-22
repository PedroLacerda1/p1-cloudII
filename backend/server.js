require('dotenv').config();
const express = require('express');
const cors = require('cors');

const produtosRoutes = require('./routes/produtos');
const clientesRoutes = require('./routes/clientes');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

app.use(cors({
    origin:'https://frontend-production-7af18.up.railway.app'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('API do e-commerce rodando. Use /api/produtos, /api/clientes e /api/pedidos.');
});

app.use('/api/produtos', produtosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});