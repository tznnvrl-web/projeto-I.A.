
const CATS = {
  'Água': 'var(--agua)',
  'Resíduos sólidos': 'var(--residuos)',
  'Esgotos': 'var(--esgotos)',
  'Drenagem': 'var(--drenagem)'
};

const CLASSE_GRAVIDADE = {
  'Alta': 'gr-alta',
  'Média': 'gr-media',
  'Baixa': 'gr-baixa'
};
const data = [
  { b: 'Bairro A', c: 'Água',             d: 'Torneira pública sem água várias horas por dia', g: 'Alta',  f: 'Pergunta breve' },
  { b: 'Bairro A', c: 'Resíduos sólidos', d: 'Lixo acumulado junto ao mercado',                g: 'Média', f: 'Observação orientada' },
  { b: 'Bairro B', c: 'Drenagem',         d: 'Vala entupida que alaga a rua na chuva',         g: 'Alta',  f: 'Observação orientada' },
  { b: 'Bairro B', c: 'Esgotos',          d: 'Latrinas sem tampa em quintais vizinhos',        g: 'Média', f: 'Observação orientada' },
  { b: 'Bairro C', c: 'Água',             d: 'Fontenário em bom estado e com uso regular',     g: 'Baixa', f: 'Fonte institucional' },
  { b: 'Bairro C', c: 'Resíduos sólidos', d: 'Sem ponto de recolha próximo',                   g: 'Alta',  f: 'Pergunta breve' },
  { b: 'Bairro D', c: 'Drenagem',         d: 'Água parada perto da escola',                    g: 'Média', f: 'Observação orientada' },
  { b: 'Bairro D', c: 'Esgotos',          d: 'Fossa séptica transborda na época chuvosa',      g: 'Alta',  f: 'Fonte institucional' },
  { b: 'Bairro D', c: 'Água',             d: 'Poço desprotegido usado para beber',             g: 'Média', f: 'Observação orientada' }
];

const $ = (id) => document.getElementById(id);

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]);
}

function listarBairros() {
  const unicos = [];
  data.forEach((r) => {
    if (unicos.indexOf(r.b) < 0) unicos.push(r.b);
  });
  return unicos.sort();
}

function opcoesCategorias() {
  return Object.keys(CATS).map((c) => `<option>${c}</option>`).join('');
}

function mostrarMensagem(texto, cor) {
  $('msg').style.color = cor;
  $('msg').textContent = texto;
}


function preencherSelects() {
  const atual = { b: $('fBairro').value, c: $('fCat').value };
  const bairros = listarBairros();

  $('fBairro').innerHTML =
    '<option value="">Todos os bairros</option>' +
    bairros.map((b) => `<option>${esc(b)}</option>`).join('');

  $('fCat').innerHTML =
    '<option value="">Todas as categorias</option>' + opcoesCategorias();

  $('fBairro').value = atual.b;
  $('fCat').value = atual.c;

  $('bairros').innerHTML = bairros
    .map((b) => `<option value="${esc(b)}">`)
    .join('');

  if (!$('nCat').options.length) {
    $('nCat').innerHTML = opcoesCategorias();
  }
}

function filtrar() {
  const b = $('fBairro').value;
  const c = $('fCat').value;
  return data.filter((r) => (!b || r.b === b) && (!c || r.c === c));
}



function desenharBarras(el, contagens, corFn) {
  const chaves = Object.keys(contagens);
  const max = Math.max(1, ...chaves.map((k) => contagens[k]));

  if (!chaves.length) {
    el.innerHTML = '<p class="sub">Sem registos para estes filtros.</p>';
    return;
  }

  el.innerHTML = chaves.map((k) => `
    <div class="bar">
      <span>${esc(k)}</span>
      <i style="width:${(contagens[k] / max) * 100}%;--c:${corFn(k)}"></i>
      <b>${contagens[k]}</b>
    </div>`).join('');
}

function desenharTiles(total, porCategoria) {
  const tileTotal =
    `<div class="tile"><b>${total}</b><span>ocorrências</span></div>`;

  const tilesCat = Object.keys(CATS).map((c) => `
    <div class="tile" style="--c:${CATS[c]}">
      <b>${porCategoria[c]}</b><span>${c}</span>
    </div>`).join('');

  $('tiles').innerHTML = tileTotal + tilesCat;
}

function desenharTabela(rows) {
  if (!rows.length) {
    $('rows').innerHTML =
      '<tr><td colspan="5">Nenhum registo para estes filtros. Mude o bairro ou a categoria.</td></tr>';
    return;
  }

  $('rows').innerHTML = rows.map((r) => `
    <tr>
      <td>${esc(r.b)}</td>
      <td><span class="tag" style="--c:${CATS[r.c]}">${esc(r.c)}</span></td>
      <td>${esc(r.d)}</td>
      <td class="${CLASSE_GRAVIDADE[r.g] || ''}">${r.g}</td>
      <td>${esc(r.f)}</td>
    </tr>`).join('');
}

function render() {
  const rows = filtrar();
  const porCategoria = {};
  const porBairro = {};

  Object.keys(CATS).forEach((c) => { porCategoria[c] = 0; });
  rows.forEach((r) => {
    porCategoria[r.c]++;
    porBairro[r.b] = (porBairro[r.b] || 0) + 1;
  });

  desenharTiles(rows.length, porCategoria);
  desenharBarras($('chartCat'), porCategoria, (k) => CATS[k]);
  desenharBarras($('chartBairro'), porBairro, () => 'var(--brand)');
  desenharTabela(rows);
}


function limparFiltros() {
  $('fBairro').value = '';
  $('fCat').value = '';
  render();
}

function adicionarRegisto() {
  const bairro = $('nBairro').value.trim();
  const descricao = $('nDesc').value.trim();

  if (!bairro || !descricao) {
    mostrarMensagem('Preencha o bairro e a descrição.', 'var(--brand)');
    return;
  }

  data.push({
    b: bairro,
    c: $('nCat').value,
    d: descricao,
    g: $('nGr').value,
    f: $('nFonte').value
  });

  $('nBairro').value = '';
  $('nDesc').value = '';

  preencherSelects();
  render();
  mostrarMensagem('Registo guardado.', 'var(--drenagem)');
}


$('fBairro').onchange = render;
$('fCat').onchange = render;
$('limpar').onclick = limparFiltros;
$('add').onclick = adicionarRegisto;

preencherSelects();
render();