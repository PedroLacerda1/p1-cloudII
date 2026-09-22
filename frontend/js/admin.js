function mostrarTab(nome) {
  ['produtos', 'clientes', 'pedidos'].forEach((t) => {
    document.getElementById('tab-' + t).style.display = t === nome ? 'block' : 'none';
  });
  if (nome === 'produtos') carregarTabelaProdutos();
  if (nome === 'clientes') carregarTabelaClientes();
  if (nome === 'pedidos') carregarTabelaPedidos();
}

/* ---------- PRODUTOS ---------- */

document.getElementById('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rowKey = document.getElementById('produtoRowKey').value;

  const formData = new FormData();
  formData.append('marca', document.getElementById('pMarca').value);
  formData.append('modelo', document.getElementById('pModelo').value);
  formData.append('valor', document.getElementById('pValor').value);
  formData.append('quantidade', document.getElementById('pQuantidade').value);
  const foto = document.getElementById('pFoto').files[0];
  if (foto) formData.append('foto', foto);

  const url = rowKey ? `${API_BASE_URL}/api/produtos/${rowKey}` : `${API_BASE_URL}/api/produtos`;
  const method = rowKey ? 'PUT' : 'POST';

  await fetch(url, { method, body: formData });

  e.target.reset();
  document.getElementById('produtoRowKey').value = '';
  carregarTabelaProdutos();
});

function limparFormProduto() {
  document.getElementById('formProduto').reset();
  document.getElementById('produtoRowKey').value = '';
}

async function carregarTabelaProdutos() {
  const res = await fetch(`${API_BASE_URL}/api/produtos`);
  const produtos = await res.json();
  const tabela = document.getElementById('tabelaProdutos');

  tabela.innerHTML = '<tr><th>Marca</th><th>Modelo</th><th>Valor</th><th>Qtd</th><th>Foto</th><th>Ações</th></tr>';

  produtos.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.marca}</td>
      <td>${p.modelo}</td>
      <td>R$ ${Number(p.valor).toFixed(2)}</td>
      <td>${p.quantidade}</td>
      <td>${p.fotoUrl ? `<img src="${p.fotoUrl}" width="50">` : '-'}</td>
      <td>
        <button onclick='editarProduto(${JSON.stringify(p)})'>Editar</button>
        <button onclick="excluirProduto('${p.rowKey}')">Excluir</button>
      </td>`;
    tabela.appendChild(tr);
  });
}

function editarProduto(p) {
  document.getElementById('produtoRowKey').value = p.rowKey;
  document.getElementById('pMarca').value = p.marca;
  document.getElementById('pModelo').value = p.modelo;
  document.getElementById('pValor').value = p.valor;
  document.getElementById('pQuantidade').value = p.quantidade;
  window.scrollTo(0, 0);
}

async function excluirProduto(rowKey) {
  if (!confirm('Excluir este produto?')) return;
  await fetch(`${API_BASE_URL}/api/produtos/${rowKey}`, { method: 'DELETE' });
  carregarTabelaProdutos();
}

/* ---------- CLIENTES ---------- */

document.getElementById('formCliente').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rowKey = document.getElementById('clienteRowKey').value;

  const dados = {
    nome: document.getElementById('cNome').value,
    email: document.getElementById('cEmail').value,
    telefone: document.getElementById('cTelefone').value,
    endereco: document.getElementById('cEndereco').value,
  };

  const url = rowKey ? `${API_BASE_URL}/api/clientes/${rowKey}` : `${API_BASE_URL}/api/clientes`;
  const method = rowKey ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });

  e.target.reset();
  document.getElementById('clienteRowKey').value = '';
  carregarTabelaClientes();
});

function limparFormCliente() {
  document.getElementById('formCliente').reset();
  document.getElementById('clienteRowKey').value = '';
}

async function carregarTabelaClientes() {
  const res = await fetch(`${API_BASE_URL}/api/clientes`);
  const clientes = await res.json();
  const tabela = document.getElementById('tabelaClientes');

  tabela.innerHTML = '<tr><th>Nome</th><th>Email</th><th>Telefone</th><th>ID (RowKey)</th><th>Ações</th></tr>';

  clientes.forEach((c) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.email}</td>
      <td>${c.telefone || ''}</td>
      <td>${c.rowKey}</td>
      <td>
        <button onclick='editarCliente(${JSON.stringify(c)})'>Editar</button>
        <button onclick="excluirCliente('${c.rowKey}')">Excluir</button>
      </td>`;
    tabela.appendChild(tr);
  });
}

function editarCliente(c) {
  document.getElementById('clienteRowKey').value = c.rowKey;
  document.getElementById('cNome').value = c.nome;
  document.getElementById('cEmail').value = c.email;
  document.getElementById('cTelefone').value = c.telefone || '';
  document.getElementById('cEndereco').value = c.endereco || '';
  window.scrollTo(0, 0);
}

async function excluirCliente(rowKey) {
  if (!confirm('Excluir este cliente?')) return;
  await fetch(`${API_BASE_URL}/api/clientes/${rowKey}`, { method: 'DELETE' });
  carregarTabelaClientes();
}

/* ---------- PEDIDOS ---------- */

async function carregarTabelaPedidos() {
  const res = await fetch(`${API_BASE_URL}/api/pedidos`);
  const pedidos = await res.json();
  const tabela = document.getElementById('tabelaPedidos');

  tabela.innerHTML = '<tr><th>Cliente (ID)</th><th>Itens</th><th>Total</th><th>Pagamento</th><th>Entrega</th><th>Data</th></tr>';

  pedidos.forEach((p) => {
    const itensTxt = p.itens.map((i) => `${i.marca} ${i.modelo} x${i.quantidade}`).join(', ');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.clienteId}</td>
      <td>${itensTxt}</td>
      <td>R$ ${Number(p.total).toFixed(2)}</td>
      <td>${p.metodoPagamento}</td>
      <td>${p.metodoEntrega}</td>
      <td>${new Date(p.criadoEm).toLocaleString()}</td>`;
    tabela.appendChild(tr);
  });
}

carregarTabelaProdutos();