/* ============================================================
   NívelDev — área logada (home.html)
   1) Proteção: quem não está logado volta para o login
   2) Dados da home (nome, cursos, exercícios, progresso)
   3) Navegação do menu: só "Início" existe; o resto mostra
      "Em desenvolvimento"
   4) Menu do usuário (Sair) e menu lateral no celular
   Depende de js/auth.js (window.NivelDevAuth).
   ============================================================ */

(function () {
  /* ---------- 1) PROTEÇÃO DA PÁGINA ---------- */
  if (!window.NivelDevAuth || !NivelDevAuth.getToken()) {
    window.location.replace('login.html');
    return;
  }

  /* ---------- 2) DADOS DA HOME ----------
     ATENÇÃO: ainda não existe API de cursos/exercícios no back-end,
     então estes números são EXEMPLOS (os mesmos do protótipo).
     Quando as rotas /courses, /exercises e /progress existirem,
     troque este objeto pelo retorno da API. */
  const dadosHome = {
    cursosEmAndamento: 1,
    exerciciosConcluidos: 8,
    cursoAtual: {
      titulo: 'Lógica de Programação',
      descricao: 'Aprenda os fundamentos da lógica e programe com confiança.',
      capa: 'logica',   // arquivo em img/cursos/ (sem .jpg)
      progresso: 65     // 0 a 100
    }
  };

  const $ = (id) => document.getElementById(id);

  const iniciais = (nome) => {
    const partes = (nome || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '?';
    const primeira = partes[0][0];
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  };

  function mostrarUsuario(usuario) {
    const nome = (usuario && usuario.nome) || '';
    $('hero-nome').textContent = nome.split(' ')[0] || 'aluno'; // textContent: sem risco de HTML injetado
    $('app-avatar').textContent = iniciais(nome);
    $('app-user-nome').textContent = (usuario && (usuario.email || usuario.nome)) || '';
  }

  function mostrarDados(d) {
    $('stat-cursos').textContent = d.cursosEmAndamento;
    $('stat-cursos-rotulo').textContent = d.cursosEmAndamento === 1 ? 'Curso em andamento' : 'Cursos em andamento';
    $('stat-exercicios').textContent = d.exerciciosConcluidos;
    $('stat-exercicios-rotulo').textContent = d.exerciciosConcluidos === 1 ? 'Exercício concluído' : 'Exercícios concluídos';

    const c = d.cursoAtual;
    $('curso-titulo').textContent = c.titulo;
    $('curso-desc').textContent = c.descricao;
    $('curso-capa').src = 'img/cursos/' + c.capa + '.jpg';
    $('curso-pct').textContent = c.progresso;
    $('curso-barra').setAttribute('aria-valuenow', String(c.progresso));
    // pequeno atraso para a barra "crescer" com animação
    requestAnimationFrame(() => { $('curso-barra-fill').style.width = c.progresso + '%'; });
  }

  /* ---------- 3) NAVEGAÇÃO ---------- */
  const TITULOS = {
    inicio: 'Início',
    cursos: 'Cursos',
    exercicios: 'Exercícios',
    progresso: 'Meu Progresso',
    perfil: 'Meu Perfil'
  };

  function irPara() {
    const nome = window.location.hash.replace('#', '');
    const tela = TITULOS[nome] ? nome : 'inicio';

    document.querySelectorAll('.app-nav-item').forEach((item) => {
      const ativo = item.dataset.view === tela;
      item.classList.toggle('is-active', ativo);
      if (ativo) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    const emDev = tela !== 'inicio';
    $('view-inicio').hidden = emDev;
    $('view-dev').hidden = !emDev;
    $('dev-titulo').textContent = emDev ? TITULOS[tela] + ' — em desenvolvimento' : '';
    document.title = TITULOS[tela] + ' — NívelDev';

    fecharMenuLateral();
    window.scrollTo(0, 0);
  }

  /* ---------- 4) MENUS ---------- */
  const menuUsuario = $('app-user-menu');
  const botaoUsuario = $('app-user-btn');
  const lateral = $('app-sidebar');
  const fundo = $('app-backdrop');
  const botaoMenu = $('app-menu-btn');

  function alternarMenuUsuario(abrir) {
    menuUsuario.hidden = !abrir;
    botaoUsuario.setAttribute('aria-expanded', String(abrir));
  }

  function abrirMenuLateral() {
    lateral.classList.add('is-open');
    fundo.hidden = false;
    botaoMenu.setAttribute('aria-expanded', 'true');
  }

  function fecharMenuLateral() {
    lateral.classList.remove('is-open');
    fundo.hidden = true;
    botaoMenu.setAttribute('aria-expanded', 'false');
  }

  botaoUsuario.addEventListener('click', (e) => {
    e.stopPropagation();
    alternarMenuUsuario(menuUsuario.hidden);
  });
  document.addEventListener('click', (e) => {
    if (!menuUsuario.contains(e.target)) alternarMenuUsuario(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { alternarMenuUsuario(false); fecharMenuLateral(); }
  });
  menuUsuario.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => alternarMenuUsuario(false)));

  botaoMenu.addEventListener('click', abrirMenuLateral);
  fundo.addEventListener('click', fecharMenuLateral);

  $('btn-sair').addEventListener('click', () => {
    NivelDevAuth.logout();
    window.location.href = 'login.html';
  });

  /* ---------- INÍCIO ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    mostrarUsuario(NivelDevAuth.getUser()); // na hora, com o que está salvo
    mostrarDados(dadosHome);
    window.addEventListener('hashchange', irPara);
    irPara();

    // confirma com o servidor se o token ainda vale (pode ter expirado)
    try {
      const { user } = await NivelDevAuth.api.me();
      mostrarUsuario(user);
    } catch (erro) {
      if (erro.status === 401) {
        NivelDevAuth.logout();
        window.location.replace('login.html');
      }
      // outros erros (servidor fora do ar etc.): mantém o que já está na tela
    }
  });
})();
