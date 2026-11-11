/* ============================================================
   NívelDev — tela de Cursos (cursos.html)
   Lista de cursos com busca, filtros de categoria e nível e
   paginação. Menu, topo, usuário e proteção da página:
   js/layout.js.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  /* ---------- DADOS ----------
     ATENÇÃO: ainda não existe API de cursos no back-end, então estes
     cursos são EXEMPLOS. Quando a rota existir, troque este array pelo
     retorno da API (mesmos campos).
       nivel:     1 = Iniciante, 2 = Intermediário, 3 = Avançado
       capa:      arquivo em img/cursos/ (sem .jpg)
       progresso: 0 a 100 (só aparece quando o aluno já começou o curso) */
  const cursos = [
    { id: 'logica',     titulo: 'Lógica de Programação',            desc: 'Aprenda os fundamentos da lógica e programe com confiança.',     categoria: 'logica',      nivel: 1, aulas: 24, capa: 'logica',     progresso: 65 },
    { id: 'python',     titulo: 'Python do Zero ao Avançado',       desc: 'Comece a programar com uma das linguagens mais amigáveis.',      categoria: 'programacao', nivel: 1, aulas: 32, capa: 'python',     progresso: 0 },
    { id: 'html-css',   titulo: 'HTML e CSS Essencial',             desc: 'Monte páginas bonitas e responsivas desde o primeiro dia.',      categoria: 'web',         nivel: 1, aulas: 20, capa: 'html-css',   progresso: 0 },
    { id: 'javascript', titulo: 'JavaScript Essencial',             desc: 'Domine a linguagem que move a web.',                             categoria: 'web',         nivel: 2, aulas: 18, capa: 'javascript', progresso: 0 },
    { id: 'sql',        titulo: 'SQL na Prática',                   desc: 'Consulte, filtre e organize dados em bancos relacionais.',       categoria: 'dados',       nivel: 2, aulas: 16, capa: 'sql',        progresso: 0 },
    { id: 'git',        titulo: 'Git e GitHub',                     desc: 'Versione seu código e trabalhe em equipe sem medo.',             categoria: 'ferramentas', nivel: 1, aulas: 12, capa: 'git',        progresso: 0 },
    { id: 'nodejs',     titulo: 'Node.js e APIs',                   desc: 'Crie servidores e APIs REST usando JavaScript.',                 categoria: 'web',         nivel: 3, aulas: 22, capa: 'nodejs',     progresso: 0 },
    { id: 'algoritmos', titulo: 'Algoritmos e Estruturas de Dados', desc: 'Resolva problemas com eficiência: listas, pilhas, filas e mais.', categoria: 'logica',      nivel: 3, aulas: 28, capa: 'algoritmos', progresso: 0 },
  ];

  const CATEGORIAS = {
    programacao: 'Programação',
    web: 'Web',
    dados: 'Banco de dados',
    ferramentas: 'Ferramentas',
    logica: 'Lógica',
  };

  const NIVEIS = { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' };

  const POR_PAGINA = 4;

  /* ---------- ELEMENTOS ---------- */
  const $ = (id) => document.getElementById(id);
  const lista = $('cr-lista');
  const vazio = $('cr-vazio');
  const rodape = $('cr-rodape');
  const paginacao = $('cr-paginacao');
  const contador = $('cr-contador');
  const busca = $('cr-busca');
  const selCategoria = $('cr-categoria');
  const selNivel = $('cr-nivel');

  let pagina = 1;
  let filtrados = cursos;

  /* ---------- ÍCONES ---------- */
  const SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const SETA_ESQ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>';

  // 3 barrinhas: as primeiras "n" ficam acesas
  function iconeNivel(nivel) {
    const barra = (x, y, h, i) => `<rect class="${i < nivel ? 'on' : ''}" x="${x}" y="${y}" width="4.4" height="${h}" rx="1.4"/>`;
    return `<svg class="cr-nivel-barras" viewBox="0 0 24 24" aria-hidden="true">${barra(4, 13, 7, 0)}${barra(9.8, 8.5, 11.5, 1)}${barra(15.6, 4, 16, 2)}</svg>`;
  }

  /* ---------- FILTROS (opções) ---------- */
  selCategoria.innerHTML = '<option value="">Categoria</option>' +
    Object.keys(CATEGORIAS).map((k) => `<option value="${k}">${CATEGORIAS[k]}</option>`).join('');

  selNivel.innerHTML = '<option value="">Nível</option>' +
    Object.keys(NIVEIS).map((k) => `<option value="${k}">${NIVEIS[k]}</option>`).join('');

  // remove acentos para a busca funcionar com "logica" ou "lógica"
  const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function aplicarFiltros() {
    const termo = normalizar(busca.value.trim());
    const cat = selCategoria.value;
    const niv = selNivel.value;

    filtrados = cursos.filter((c) =>
      (!cat || c.categoria === cat) &&
      (!niv || String(c.nivel) === niv) &&
      (!termo || normalizar(c.titulo).includes(termo) || normalizar(c.desc).includes(termo) ||
        normalizar(CATEGORIAS[c.categoria]).includes(termo))
    );
    pagina = 1;
    render();
  }

  /* ---------- RENDERIZAÇÃO ---------- */
  function cardCurso(c) {
    const comecou = c.progresso > 0;
    const acao = comecou ? 'Continuar o curso' : 'Abrir o curso';
    return `
      <li>
        <article class="cr-card">
          <img class="cr-capa" src="img/cursos/${c.capa}.jpg" alt="" width="132" height="132" loading="lazy">
          <div class="cr-info">
            <h3>${c.titulo}</h3>
            <p>${c.desc}</p>
            <div class="cr-meta">
              <span>${iconeNivel(c.nivel)}${NIVEIS[c.nivel]}</span>
              <span>${PLAY}${c.aulas} aulas</span>
            </div>
            ${comecou ? `
            <div class="cr-progresso">
              <div class="app-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progresso}" aria-label="Progresso em ${c.titulo}">
                <span style="width:${c.progresso}%"></span>
              </div>
              <span class="cr-progresso-txt">${c.progresso}% concluído</span>
            </div>` : ''}
          </div>
          <button type="button" class="cr-ir" data-curso="${c.id}" aria-label="${acao}: ${c.titulo}">${SETA}</button>
        </article>
      </li>`;
  }

  function botaoPagina(texto, destino, atual, rotulo) {
    return `<button type="button" class="cr-pag" data-pagina="${destino}"` +
      (atual ? ' aria-current="page"' : '') +
      (rotulo ? ` aria-label="${rotulo}"` : ` aria-label="Página ${destino}"`) + `>${texto}</button>`;
  }

  function render() {
    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
    pagina = Math.min(pagina, totalPaginas);

    const inicio = (pagina - 1) * POR_PAGINA;
    const visiveis = filtrados.slice(inicio, inicio + POR_PAGINA);

    lista.innerHTML = visiveis.map(cardCurso).join('');
    lista.hidden = visiveis.length === 0;
    vazio.hidden = visiveis.length > 0;
    rodape.hidden = visiveis.length === 0;

    // paginação: ‹ 1 2 3 ›  (setas só quando há para onde ir)
    let html = '';
    if (pagina > 1) html += botaoPagina(SETA_ESQ, pagina - 1, false, 'Página anterior');
    if (totalPaginas > 1) {
      for (let p = 1; p <= totalPaginas; p++) html += botaoPagina(p, p, p === pagina);
    }
    if (pagina < totalPaginas) html += botaoPagina(SETA, pagina + 1, false, 'Próxima página');
    paginacao.innerHTML = html;

    const n = filtrados.length;
    contador.textContent = n === 1
      ? 'Mostrando 1 curso'
      : `Mostrando ${inicio + 1}–${inicio + visiveis.length} de ${n} cursos`;
  }

  /* ---------- EVENTOS ---------- */
  busca.addEventListener('input', aplicarFiltros);
  selCategoria.addEventListener('change', aplicarFiltros);
  selNivel.addEventListener('change', aplicarFiltros);

  $('cr-limpar').addEventListener('click', () => {
    busca.value = '';
    selCategoria.value = '';
    selNivel.value = '';
    aplicarFiltros();
    busca.focus();
  });

  paginacao.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-pagina]');
    if (!botao) return;
    pagina = Number(botao.dataset.pagina);
    render();
    // volta para o começo da lista se ela ficou acima da tela
    const titulo = $('cr-lista-titulo');
    if (titulo.getBoundingClientRect().top < 0) titulo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    paginacao.querySelector('[aria-current="page"]').focus();
  });

  // TODO: quando existir a tela do curso, troque o aviso por
  //       window.location.href = 'curso.html?id=' + id
  lista.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-curso]');
    if (!botao) return;
    const curso = cursos.find((c) => c.id === botao.dataset.curso);
    NivelDevUI.toast('As aulas de “' + curso.titulo + '” chegam em breve.', 'info');
  });

  render();
})();
