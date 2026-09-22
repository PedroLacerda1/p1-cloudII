document.getElementById('formCliente').addEventListener('submit', async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById('cNome').value,
    email: document.getElementById('cEmail').value,
    telefone: document.getElementById('cTelefone').value,
    endereco: document.getElementById('cEndereco').value,
  };

  const res = await fetch(`${API_BASE_URL}/api/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  const data = await res.json();

  document.getElementById('msgCadastro').innerText = res.ok
    ? `Cadastrado com sucesso! Guarde seu ID: ${data.rowKey}`
    : 'Erro ao cadastrar.';

  e.target.reset();
});

async function buscarCliente() {
  const id = document.getElementById('buscaId').value.trim();
  if (!id) return;

  const res = await fetch(`${API_BASE_URL}/api/clientes/${id}`);
  if (!res.ok) {
    document.getElementById('dadosCliente').innerHTML = '<p>Cliente não encontrado.</p>';
    document.getElementById('listaPedidos').innerHTML = '';
    return;
  }

  const c = await res.json();
  document.getElementById('dadosCliente').innerHTML = `
    <form id="formEdicao">
      <input id="eNome" value="${c.nome}" placeholder="Nome">
      <input id="eEmail" value="${c.email}" placeholder="Email">
      <input id="eTelefone" value="${c.telefone || ''}" placeholder="Telefone">
      <input id="eEndereco" value="${c.endereco || ''}" placeholder="Endereço">
      <button type="submit">Atualizar Dados</button>
    </form>
  `;

  document.getElementById('formEdicao').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await fetch(`${API_BASE_URL}/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: document.getElementById('eNome').value,
        email: document.getElementById('eEmail').value,
        telefone: document.getElementById('eTelefone').value,
        endereco: document.getElementById('eEndereco').value,
      }),
    });
    alert('Dados atualizados com sucesso!');
  });

  const resPedidos = await fetch(`${API_BASE_URL}/api/clientes/${id}/pedidos`);
  const pedidos = await resPedidos.json();
  const lista = document.getElementById('listaPedidos');
  lista.innerHTML = '';

  if (pedidos.length === 0) {
    lista.innerHTML = '<li>Nenhum pedido ainda.</li>';
    return;
  }

  pedidos.forEach((p) => {
    const itens = JSON.parse(p.itens);
    const li = document.createElement('li');
    li.innerText = `${new Date(p.criadoEm).toLocaleString()} — Total: R$ ${Number(p.total).toFixed(2)} — ${itens
      .map((i) => `${i.modelo} x${i.quantidade}`)
      .join(', ')} — Pagamento: ${p.metodoPagamento} — Entrega: ${p.metodoEntrega}`;
    lista.appendChild(li);
  });
}