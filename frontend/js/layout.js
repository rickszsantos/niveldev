/* ============================================================
   NívelDev — layout das telas logadas (home, exercícios, categoria)
   Monta o MENU LATERAL e o TOPO em um só lugar, então qualquer
   mudança no menu é feita aqui e vale para todas as telas.

   Como usar numa tela nova:
     <body class="app-page" data-pagina="nome-da-tela">
       <div class="app-shell">
         <div data-layout="menu"></div>
         <div class="app-main">
           <div data-layout="topo"></div>
           <main class="app-content" id="app-content"> ... </main>
         </div>
       </div>
       <script src="js/auth.js"></script>
       <script src="js/ui.js"></script>
       <script src="js/layout.js"></script>

   Também cuida de:
   - proteção da página (sem login → volta para login.html)
   - avatar e nome do usuário (confirma o token no servidor)
   - menu do usuário, notificações, busca (ícone que abre o campo), recolher menu

   Depende de js/auth.js, js/ui.js e js/preferencias.js.
   Outros scripts podem usar:  NivelDevLayout.usuario((user) => { ... })
   ============================================================ */

(function () {
  /* ---------- PROTEÇÃO DA PÁGINA ---------- */
  if (!window.NivelDevAuth || !NivelDevAuth.getToken()) {
    window.location.replace('login.html');
    return;
  }

  const pagina = document.body.dataset.pagina || '';
  const naHome = pagina === 'home';
  const $ = (id) => document.getElementById(id);

  /* ---------- MENU (edite aqui para mudar o menu de todas as telas) ---------- */
  const ICONE = {
    inicio:     '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z"/>',
    cursos:     '<path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5"/><path d="M22 9v6"/>',
    exercicios: '<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13.5 5l-3 14"/>',
    progresso:  '<path d="M4 20v-4h5v-4h5V8h6v12H4z"/>',
    perfil:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    ajustes:    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',
  };

  // na home os itens trocam de "view" pela # da URL; nas outras telas levam para a home
  const base = naHome ? '' : 'home.html';
  const ITENS = [
    { id: 'inicio',     texto: 'Início',        href: base + '#inicio',    view: 'inicio' },
    { id: 'cursos',     texto: 'Cursos',        href: base + '#cursos',    view: 'cursos' },
    { id: 'exercicios', texto: 'Exercícios',    href: 'exercicios.html',   view: null },
    { id: 'progresso',  texto: 'Meu Progresso', href: base + '#progresso', view: 'progresso' },
    { id: 'perfil',     texto: 'Meu Perfil',    href: base + '#perfil',    view: 'perfil' },
    '---',
    { id: 'ajustes',    texto: 'Ajustes',       href: base + '#ajustes',   view: 'ajustes' },
  ];

  // categoria.html pertence ao menu "Exercícios"
  const ativoNestaTela = pagina === 'categoria' ? 'exercicios' : pagina;

  const svg = (caminhos) => `<svg viewBox="0 0 24 24" aria-hidden="true">${caminhos}</svg>`;

  const htmlMenu = `
    <aside class="app-sidebar" id="app-sidebar" aria-label="Menu principal">
      <button type="button" class="app-collapse" id="app-collapse" aria-controls="app-sidebar">
        <svg class="app-collapse-forma" viewBox="0 0 34 64" aria-hidden="true" focusable="false">
          <path class="preenche" d="M-1 0H11.5V.5A14 14 0 0 1 25.5 14.5V41.5A14 14 0 0 1 11.5 55.5H8.5A8 8 0 0 0 .5 63.5H-1Z"/>
          <path class="contorno" d="M11.5 .5A14 14 0 0 1 25.5 14.5V41.5A14 14 0 0 1 11.5 55.5H8.5A8 8 0 0 0 .5 63.5"/>
          <path class="borda-int" d="M3 3H11.5A11.5 11.5 0 0 1 23 14.5V41.5A11.5 11.5 0 0 1 11.5 53H3"/>
        </svg>
        <svg class="app-collapse-seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>
      </button>

      <a href="${naHome ? '#inicio' : 'home.html'}" class="app-logo" aria-label="NívelDev — início">
        <img class="logo-claro"  src="img/logo-niveldev.png"        alt="NívelDev">
        <img class="logo-escuro" src="img/logo-niveldev-branco.png" alt="NívelDev">
      </a>

      <nav class="app-nav">
        ${ITENS.map((i) => {
          if (i === '---') return '<hr class="app-nav-sep">';
          const ativo = i.id === ativoNestaTela;
          return `
        <a href="${i.href}" class="app-nav-item${ativo ? ' is-active' : ''}" data-tip="${i.texto}"
           ${i.view ? `data-view="${i.view}"` : ''} ${ativo ? 'aria-current="page"' : ''}>
          ${svg(ICONE[i.id])}
          <span class="app-nav-clip"><span class="app-nav-label">${i.texto}</span></span>
        </a>`;
        }).join('')}
      </nav>
    </aside>`;

  /* ---------- TOPO ---------- */
  // As notificações abaixo são EXEMPLOS. Quando existir uma API, troque por dados reais.
  const htmlTopo = `
    <header class="app-topbar">
      <div class="app-acoes">
        <!-- busca: só o ícone; ao clicar, o campo abre ao lado -->
        <div class="app-busca" id="app-busca">
          <input type="search" id="app-busca-global" placeholder="Buscar cursos, exercícios…" autocomplete="off" aria-label="Busca geral" tabindex="-1">
          <button type="button" class="app-icon-btn" id="btn-busca" aria-label="Buscar" aria-expanded="false">
            ${svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>')}
          </button>
        </div>

        <div class="app-pop">
          <button type="button" class="app-icon-btn" id="btn-notif" aria-haspopup="true" aria-expanded="false" aria-label="Notificações">
            ${svg('<path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z"/><path d="M10 21h4"/>')}
            <span class="app-ponto" id="notif-ponto" aria-hidden="true"></span>
          </button>
          <div class="app-menu-pop app-notif" id="menu-notif" hidden>
            <p class="app-pop-titulo">Notificações</p>
            <ul class="app-notif-lista">
              <li class="is-nova"><span class="app-notif-icone">${svg('<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>')}</span>
                <div><strong>Você subiu para o nível 7!</strong><span>há 2 horas</span></div></li>
              <li class="is-nova"><span class="app-notif-icone">${svg('<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13.5 5l-3 14"/>')}</span>
                <div><strong>Novo desafio semanal disponível</strong><span>ontem</span></div></li>
            </ul>
          </div>
        </div>

        <div class="app-pop">
          <button type="button" class="app-user-btn" id="app-user-btn" aria-haspopup="true" aria-expanded="false" aria-label="Menu do usuário">
            <span class="app-avatar" id="app-avatar">…</span>
            <svg class="app-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="app-menu-pop app-user-menu" id="app-user-menu" hidden>
            <p class="app-user-nome" id="app-user-nome"></p>
            <a href="${base}#perfil" class="app-user-item">Meu Perfil</a>
            <a href="${base}#ajustes" class="app-user-item">Ajustes</a>
            <button type="button" class="app-user-item" id="btn-sair">Sair</button>
          </div>
        </div>
      </div>
    </header>`;

  document.querySelector('[data-layout="menu"]').outerHTML = htmlMenu;
  document.querySelector('[data-layout="topo"]').outerHTML = htmlTopo;

  /* ---------- USUÁRIO ---------- */
  const ouvintes = [];
  let usuarioAtual = NivelDevAuth.getUser();

  const iniciais = (nome) => {
    const partes = (nome || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  };

  // foto escolhida em "Meu Perfil" (guardada só neste navegador por enquanto)
  function fotoSalva(usuario) {
    try {
      const id = usuario && (usuario.id || usuario.email);
      const p = JSON.parse(localStorage.getItem('niveldev_perfil_' + id) || 'null');
      return p && typeof p.foto === 'string' && p.foto.indexOf('data:image/') === 0 ? p.foto : '';
    } catch (e) { return ''; }
  }

  function mostrarUsuario(usuario) {
    usuarioAtual = usuario;
    const nome = (usuario && usuario.nome) || '';
    const foto = fotoSalva(usuario);
    const av = $('app-avatar');
    av.textContent = foto ? '' : iniciais(nome);
    av.style.backgroundImage = foto ? 'url("' + foto + '")' : '';
    av.classList.toggle('tem-foto', !!foto);
    $('app-user-nome').textContent = (usuario && (usuario.email || usuario.nome)) || '';
    ouvintes.forEach((fn) => fn(usuario));
  }

  mostrarUsuario(usuarioAtual); // na hora, com o que está salvo

  // confirma com o servidor se o token ainda vale (pode ter expirado)
  NivelDevAuth.api.me()
    .then(({ user }) => mostrarUsuario(user))
    .catch((erro) => {
      if (erro.status === 401) {
        NivelDevAuth.logout();
        window.location.replace('login.html');
      }
      // outros erros (servidor fora do ar etc.): mantém o que já está na tela
    });

  /* ---------- MENUS SUSPENSOS (usuário e notificações) ---------- */
  const pops = [
    { botao: $('app-user-btn'), menu: $('app-user-menu') },
    { botao: $('btn-notif'),    menu: $('menu-notif') },
  ];

  function fecharPops(exceto) {
    pops.forEach((p) => {
      if (p === exceto) return;
      p.menu.hidden = true;
      p.botao.setAttribute('aria-expanded', 'false');
    });
  }

  pops.forEach((p) => {
    p.botao.addEventListener('click', (e) => {
      e.stopPropagation();
      fecharPops(p);
      abrirBusca(false);
      p.menu.hidden = !p.menu.hidden;
      p.botao.setAttribute('aria-expanded', String(!p.menu.hidden));
      if (p.botao.id === 'btn-notif') $('notif-ponto').hidden = true; // "leu" as notificações
    });
    p.menu.addEventListener('click', (e) => e.stopPropagation());
  });
  document.addEventListener('click', () => fecharPops(null));

  $('btn-sair').addEventListener('click', () => {
    NivelDevAuth.logout();
    window.location.href = 'login.html';
  });

  /* ---------- MENU RECOLHIDO ---------- */
  const botaoRecolher = $('app-collapse');
  function atualizarBotaoRecolher() {
    const recolhido = NivelDevPrefs.menuRecolhido();
    const texto = recolhido ? 'Expandir menu' : 'Recolher menu';
    botaoRecolher.setAttribute('aria-expanded', String(!recolhido));
    botaoRecolher.setAttribute('aria-label', texto);
    botaoRecolher.setAttribute('title', texto);
  }
  botaoRecolher.addEventListener('click', () => {
    NivelDevPrefs.alternarMenu();
    atualizarBotaoRecolher();
  });
  atualizarBotaoRecolher();

  /* ---------- BUSCA DO TOPO (ícone que abre o campo) ---------- */
  const caixaBusca = $('app-busca');
  const campoBusca = $('app-busca-global');
  const botaoBusca = $('btn-busca');

  function abrirBusca(abrir) {
    caixaBusca.classList.toggle('is-aberta', abrir);
    botaoBusca.setAttribute('aria-expanded', String(abrir));
    campoBusca.tabIndex = abrir ? 0 : -1;
    if (abrir) campoBusca.focus();
    else campoBusca.value = '';
  }

  botaoBusca.addEventListener('click', (e) => {
    e.stopPropagation();
    abrirBusca(!caixaBusca.classList.contains('is-aberta'));
  });
  caixaBusca.addEventListener('click', (e) => e.stopPropagation());
  // clicou fora com o campo vazio: fecha
  document.addEventListener('click', () => { if (!campoBusca.value.trim()) abrirBusca(false); });

  // TODO: ligar à busca de verdade quando existir uma API
  campoBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && campoBusca.value.trim()) {
      NivelDevUI.toast('A busca geral ainda está em desenvolvimento.', 'info');
    }
    if (e.key === 'Escape') abrirBusca(false);
  });

  // Esc fecha os menus suspensos abertos
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharPops(null); });

  /* ---------- API PARA AS TELAS ---------- */
  window.NivelDevLayout = {
    // chama a função agora (com o usuário salvo) e de novo quando o servidor confirmar
    usuario(fn) {
      ouvintes.push(fn);
      fn(usuarioAtual);
    },
    // redesenha o avatar do topo (ex.: depois de trocar a foto do perfil)
    atualizarAvatar() { mostrarUsuario(usuarioAtual); },
  };
})();
