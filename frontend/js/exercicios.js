/* ============================================================
   NívelDev — tela de Exercícios (exercicios.html)
   Lista de categorias com busca e paginação
   Menu, topo, usuário e proteção da página: js/layout.js.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  // ===== ÍCONES (SVG inline) =====
  const ICONS = {
    play:    '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none"/></svg>',
    math:    '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18M6 7.5h3M15 7.5h3M16.5 6v3M6 16.5h3M15 15l3 3M18 15l-3 3"/></svg>',
    text:    '<span class="ex-icone-texto">Aa</span>',
    layers:  '<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5" opacity=".8"/></svg>',
    logic:   '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="5" height="5" rx="1"/><rect x="9.5" y="17" width="5" height="5" rx="1"/><rect x="17" y="17" width="5" height="5" rx="1"/><path d="M12 7v10M4.5 17v-4h15v4"/></svg>',
    more:    '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="2" fill="currentColor" stroke="none"/></svg>',
    code:    '<svg viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>',
    loop:    '<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
    branch:  '<svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-6 3-12 6"/></svg>',
    file:    '<svg viewBox="0 0 24 24"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    box:     '<svg viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    alert:   '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></svg>',
    search:  '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    sort:    '<svg viewBox="0 0 24 24"><path d="M7 4v16M3 16l4 4 4-4M14 6h7M14 12h5M14 18h3"/></svg>',
    graph:   '<svg viewBox="0 0 24 24"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8.5M18 8l-5 8.5"/></svg>',
    lock:    '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
    clock:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    globe:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    terminal:'<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 9l3 3-3 3M12 15h6"/></svg>',
  };

  const ARROW = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const PREV  = '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>';
  const NEXT  = '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';

  // ===== DADOS (troque por fetch na API do backend quando estiver pronta) =====
  // feitos = exercícios já concluídos pelo aluno (EXEMPLO; vem da API no futuro)
  const categorias = [
    { id: "iniciante",   nome: "Iniciante",            desc: "Comece sua jornada com exercícios básicos.",              total: 12, feitos: 8, icone: "play" },
    { id: "python",      nome: "Python",               desc: "Sintaxe e fundamentos da linguagem Python.",              total: 18, feitos: 3, icone: "terminal" },
    { id: "strings",     nome: "Strings",              desc: "Manipulação e processamento de textos.",                  total: 15, feitos: 1, icone: "text" },
    { id: "estruturas",  nome: "Estruturas de Dados",  desc: "Listas, pilhas, filas e estruturas avançadas.",           total: 14, icone: "layers" },
    { id: "logica",      nome: "Lógica",               desc: "Desafios de lógica e raciocínio computacional.",          total: 16, icone: "logic" },
    { id: "outros",      nome: "Outros",               desc: "Exercícios variados para expandir seus conhecimentos.",   total: 10, icone: "more" },
    { id: "variaveis",   nome: "Variáveis e Tipos",    desc: "Declaração, tipos primitivos e conversões.",              total: 11, icone: "code" },
    { id: "condicionais",nome: "Condicionais",         desc: "Tomada de decisão com if, elif e else.",                  total: 13, icone: "branch" },
    { id: "repeticao",   nome: "Laços de Repetição",   desc: "Pratique for, while e controle de fluxo.",                total: 17, icone: "loop" },
    { id: "funcoes",     nome: "Funções",              desc: "Parâmetros, retorno e reutilização de código.",           total: 15, icone: "code" },
    { id: "listas",      nome: "Listas",               desc: "Criação, fatiamento e métodos de listas.",                total: 14, icone: "layers" },
    { id: "dicionarios", nome: "Dicionários",          desc: "Pares chave-valor e buscas eficientes.",                  total: 12, icone: "box" },
    { id: "tuplas",      nome: "Tuplas e Conjuntos",   desc: "Coleções imutáveis e operações de conjuntos.",            total: 9,  icone: "box" },
    { id: "recursao",    nome: "Recursão",             desc: "Resolva problemas chamando a própria função.",            total: 10, icone: "loop" },
    { id: "ordenacao",   nome: "Ordenação",            desc: "Bubble, insertion, merge e quick sort.",                  total: 12, icone: "sort" },
    { id: "busca",       nome: "Algoritmos de Busca",  desc: "Busca linear, binária e suas variações.",                 total: 8,  icone: "search" },
    { id: "poo",         nome: "Orientação a Objetos", desc: "Classes, objetos, herança e polimorfismo.",               total: 16, icone: "box" },
    { id: "arquivos",    nome: "Arquivos",             desc: "Leitura e escrita de arquivos de texto e CSV.",           total: 9,  icone: "file" },
    { id: "excecoes",    nome: "Exceções",             desc: "Tratamento de erros com try e except.",                   total: 8,  icone: "alert" },
    { id: "modulos",     nome: "Módulos",              desc: "Importação e uso da biblioteca padrão.",                  total: 7,  icone: "layers" },
    { id: "regex",       nome: "Expressões Regulares", desc: "Padrões para validar e extrair textos.",                  total: 9,  icone: "text" },
    { id: "datas",       nome: "Datas e Horas",        desc: "Trabalhe com datetime e formatação de datas.",            total: 8,  icone: "clock" },
    { id: "matrizes",    nome: "Matrizes",             desc: "Listas bidimensionais e operações com matrizes.",         total: 11, icone: "math" },
    { id: "pilhas",      nome: "Pilhas e Filas",       desc: "Implemente estruturas LIFO e FIFO.",                      total: 10, icone: "layers" },
    { id: "arvores",     nome: "Árvores",              desc: "Árvores binárias, percursos e buscas.",                   total: 9,  icone: "logic" },
    { id: "grafos",      nome: "Grafos",               desc: "Representação, BFS, DFS e caminhos.",                     total: 10, icone: "graph" },
    { id: "dinamica",    nome: "Programação Dinâmica", desc: "Otimize soluções com memorização.",                       total: 8,  icone: "logic" },
    { id: "gulosos",     nome: "Algoritmos Gulosos",   desc: "Escolhas locais para soluções ótimas.",                   total: 7,  icone: "check" },
    { id: "numeros",     nome: "Teoria dos Números",   desc: "Primos, MDC, MMC e divisibilidade.",                      total: 12, icone: "math" },
    { id: "combinatoria",nome: "Combinatória",         desc: "Permutações, combinações e arranjos.",                    total: 8,  icone: "math" },
    { id: "geometria",   nome: "Geometria",            desc: "Áreas, distâncias e coordenadas.",                        total: 9,  icone: "math" },
    { id: "bits",        nome: "Manipulação de Bits",  desc: "Operadores bit a bit e representação binária.",           total: 7,  icone: "code" },
    { id: "compreensoes",nome: "Compreensões",         desc: "List, dict e set comprehensions.",                        total: 10, icone: "code" },
    { id: "lambdas",     nome: "Funções Lambda",       desc: "Funções anônimas com map, filter e sorted.",              total: 8,  icone: "code" },
    { id: "geradores",   nome: "Geradores",            desc: "Iteradores e a palavra-chave yield.",                     total: 6,  icone: "loop" },
    { id: "decoradores", nome: "Decoradores",          desc: "Estenda funções de forma elegante.",                      total: 6,  icone: "layers" },
    { id: "json",        nome: "JSON",                 desc: "Serialização e leitura de dados estruturados.",           total: 7,  icone: "file" },
    { id: "apis",        nome: "Consumo de APIs",      desc: "Requisições HTTP e tratamento de respostas.",             total: 6,  icone: "globe" },
    { id: "testes",      nome: "Testes",               desc: "Escreva testes com assert e unittest.",                   total: 7,  icone: "check" },
    { id: "depuracao",   nome: "Depuração",            desc: "Encontre e corrija erros em códigos prontos.",            total: 9,  icone: "search" },
    { id: "formatacao",  nome: "Formatação de Saída",  desc: "f-strings, alinhamento e casas decimais.",                total: 8,  icone: "text" },
    { id: "entrada",     nome: "Entrada e Saída",      desc: "Leitura de dados com input e exibição com print.",        total: 10, icone: "code" },
    { id: "hashing",     nome: "Hashing",              desc: "Tabelas hash e contagem de frequências.",                 total: 6,  icone: "lock" },
    { id: "criptografia",nome: "Criptografia Básica",  desc: "Cifras de César, Vigenère e codificação.",                total: 7,  icone: "lock" },
    { id: "simulacao",   nome: "Simulação",            desc: "Modele situações do mundo real em código.",               total: 8,  icone: "clock" },
    { id: "jogos",       nome: "Jogos Simples",        desc: "Pedra-papel-tesoura, forca e adivinhação.",               total: 9,  icone: "play" },
    { id: "desafios",    nome: "Desafios Semanais",    desc: "Problemas novos toda semana para testar você.",           total: 12, icone: "check" },
    { id: "entrevistas", nome: "Entrevistas Técnicas", desc: "Questões clássicas de processos seletivos.",              total: 14, icone: "logic" },
  ];

  /* ============================================================
     ESTADO E RENDERIZAÇÃO DAS CATEGORIAS
     ============================================================ */
  const POR_PAGINA = { blocos: 6, lista: 8 }; // 3 por linha x 2 linhas, ou 8 linhas
  const MAX_BOTOES = 3; // quantos números de página aparecem por vez
  // modo de exibição escolhido (fica salvo neste navegador)
  const CHAVE_VISAO = 'niveldev_exercicios_visao';
  let visao = 'blocos';
  try { if (localStorage.getItem(CHAVE_VISAO) === 'lista') visao = 'lista'; } catch (e) { /* sem storage */ }
  const porPagina = () => POR_PAGINA[visao];

  let paginaAtual = 1;
  let filtradas = [...categorias];

  const $ = (id) => document.getElementById(id);
  const grid = $('ex-grid');
  const paginacao = $('ex-paginacao');
  const contador = $('ex-contador');
  const vazio = $('ex-vazio');
  const busca = $('ex-busca');
  const botoesVisao = document.querySelectorAll('.ex-visao-btn');

  // aplica o modo (blocos/lista) na grade e nos botões
  function aplicarVisao() {
    grid.classList.toggle('ex-grid--lista', visao === 'lista');
    botoesVisao.forEach((b) => {
      const ativo = b.dataset.visao === visao;
      b.classList.toggle('is-active', ativo);
      b.setAttribute('aria-pressed', String(ativo));
    });
  }

  botoesVisao.forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.visao === visao) return;
    visao = b.dataset.visao;
    try { localStorage.setItem(CHAVE_VISAO, visao); } catch (e) { /* sem storage */ }
    paginaAtual = 1;
    aplicarVisao();
    render();
  }));

  function renderCards() {
    const inicio = (paginaAtual - 1) * porPagina();
    const pagina = filtradas.slice(inicio, inicio + porPagina());

    grid.innerHTML = pagina.map((c, i) => {
      const feitos = c.feitos || 0;
      const pct = Math.round((feitos / c.total) * 100);
      return `
      <a class="app-card app-card--link ex-card" style="--i:${i}" href="categoria.html?id=${c.id}">
        <div class="ex-icone" aria-hidden="true">${ICONS[c.icone] || ICONS.code}</div>
        <div class="ex-info">
          <h3>${c.nome}</h3>
          <p>${c.desc}</p>
          <div class="ex-progresso" title="${feitos} de ${c.total} concluídos">
            <div class="app-barra" aria-hidden="true"><span style="width:${pct}%"></span></div>
            <span class="ex-qtd">${feitos}/${c.total}</span>
          </div>
        </div>
        <span class="ex-seta" aria-hidden="true">${ARROW}</span>
      </a>`;
    }).join('');

    vazio.hidden = filtradas.length > 0;
  }

  function renderPaginacao() {
    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina()));

    // janela de páginas visíveis centrada na atual
    let inicio = Math.max(1, paginaAtual - Math.floor(MAX_BOTOES / 2));
    const fim = Math.min(totalPaginas, inicio + MAX_BOTOES - 1);
    inicio = Math.max(1, fim - MAX_BOTOES + 1);

    let html = `<button type="button" class="ex-pag-btn ex-pag-nav" data-page="${paginaAtual - 1}" ${paginaAtual === 1 ? 'disabled' : ''} aria-label="Página anterior">${PREV}</button>`;
    for (let p = inicio; p <= fim; p++) {
      const ativo = p === paginaAtual;
      html += `<button type="button" class="ex-pag-btn ${ativo ? 'is-active' : ''}" data-page="${p}" ${ativo ? 'aria-current="page"' : ''}>${p}</button>`;
    }
    html += `<button type="button" class="ex-pag-btn ex-pag-nav" data-page="${paginaAtual + 1}" ${paginaAtual === totalPaginas ? 'disabled' : ''} aria-label="Próxima página">${NEXT}</button>`;

    paginacao.innerHTML = html;
    paginacao.hidden = filtradas.length === 0;

    const de = filtradas.length ? (paginaAtual - 1) * porPagina() + 1 : 0;
    const ate = Math.min(paginaAtual * porPagina(), filtradas.length);
    contador.textContent = filtradas.length ? `Mostrando ${de} – ${ate} de ${filtradas.length} categorias` : '';
  }

  function render() {
    renderCards();
    renderPaginacao();
  }

  paginacao.addEventListener('click', (e) => {
    const btn = e.target.closest('.ex-pag-btn');
    if (!btn || btn.disabled) return;
    paginaAtual = Number(btn.dataset.page);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // remove acentos para a busca funcionar com "logica" ou "lógica"
  const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  busca.addEventListener('input', () => {
    const termo = normalizar(busca.value.trim());
    filtradas = categorias.filter((c) =>
      normalizar(c.nome).includes(termo) || normalizar(c.desc).includes(termo)
    );
    paginaAtual = 1;
    render();
  });

  /* ---------- INÍCIO ----------
     Quando existir a API, mostre os esqueletos até o fetch terminar
     e chame render() com os dados. Por enquanto os dados já estão aqui. */
  aplicarVisao();
  NivelDevUI.esqueletos(grid, porPagina(), 'ex-card');
  paginacao.hidden = true;
  setTimeout(render, 450);
})();
