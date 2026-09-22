let carrinho = [];

async function carregarProdutos() {
  const marca = document.getElementById('fMarca').value;
  const modelo = document.getElementById('fModelo').value;
  const precoMin = document.getElementById('fPrecoMin').value;
  const precoMax = document.getElementById('fPrecoMax').value;

  const params = new URLSearchParams();
  if (marca) params.append('marca', marca);
  if (modelo) params.append('modelo', modelo);
  if (precoMin) params.append('precoMin', precoMin);
  if (precoMax) params.append('precoMax', precoMax);

  const res = await fetch(`${API_BASE_URL}/api/produtos?${params.toString()}`);
  const produtos = await res.json();

  const container = document.getElementById('produtos');
  container.innerHTML = '';

  if (produtos.length === 0) {
    container.innerHTML = '<p>Nenhum produto encontrado.</p>';
    return;
  }

  produtos.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.fotoUrl || 'https://via.placeholder.com/200x140?text=Sem+foto'}" alt="${p.modelo}">
      <h3>${p.marca} ${p.modelo}</h3>
      <p>R$ ${Number(p.valor).toFixed(2)}</p>
      <p>Disponível: ${p.quantidade}</p>
      <button ${p.quantidade <= 0 ? 'disabled' : ''}
        onclick='adicionarCarrinho(${JSON.stringify(p.rowKey)}, ${JSON.stringify(p.marca)}, ${JSON.stringify(p.modelo)}, ${p.valor}, ${p.quantidade})'>
        Adicionar
      </button>
    `;
    container.appendChild(card);
  });
}

function adicionarCarrinho(produtoId, marca, modelo, valor, disponivel) {
  const existente = carrinho.find((i) => i.produtoId === produtoId);
  if (existente) {
    if (existente.quantidade + 1 > disponivel) {
      alert('Quantidade indisponível em estoque.');
      return;
    }
    existente.quantidade++;
  } else {
    carrinho.push({ produtoId, marca, modelo, valor, quantidade: 1 });
  }
  renderCarrinho();
}

function renderCarrinho() {
  const lista = document.getElementById('listaCarrinho');
  lista.innerHTML = '';
  let total = 0;

  carrinho.forEach((item, idx) => {
    total += item.valor * item.quantidade;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.marca} ${item.modelo} x${item.quantidade} — R$ ${(item.valor * item.quantidade).toFixed(2)}</span>
      <button onclick="removerItem(${idx})">Remover</button>
    `;
    lista.appendChild(li);
  });

  document.getElementById('totalCarrinho').innerText = total.toFixed(2);
}

function removerItem(idx) {
  carrinho.splice(idx, 1);
  renderCarrinho();
}

async function finalizarPedido() {
  const clienteId = document.getElementById('clienteId').value.trim();
  const metodoPagamento = document.getElementById('metodoPagamento').value;
  const metodoEntrega = document.getElementById('metodoEntrega').value;
  const msg = document.getElementById('msgPedido');

  if (!clienteId || carrinho.length === 0) {
    msg.innerText = 'Informe o ID do cliente e adicione produtos ao carrinho.';
    return;
  }

  const itens = carrinho.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade }));

  const res = await fetch(`${API_BASE_URL}/api/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clienteId, itens, metodoPagamento, metodoEntrega }),
  });
  const data = await res.json();

  if (res.ok) {
    msg.innerText = `Pedido confirmado! Total: R$ ${Number(data.total).toFixed(2)}`;
    carrinho = [];
    renderCarrinho();
    carregarProdutos();
  } else {
    msg.innerText = 'Erro: ' + data.erro;
  }
}

carregarProdutos();