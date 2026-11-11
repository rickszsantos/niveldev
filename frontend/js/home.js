/* ============================================================
   NívelDev — home (home.html)
   1) Dados da home (nome, nível, sequência, cursos, conquistas)
   2) Navegação do menu: Início, Perfil, Progresso e Ajustes existem
      (js/conta.js cuida das três últimas); Cursos tem tela própria (cursos.html)
   Menu, topo, usuário e proteção da página: js/layout.js.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  /* ---------- 1) DADOS DA HOME ----------
     ATENÇÃO: ainda não existe API de cursos/exercícios/progresso
     no back-end, então estes números são EXEMPLOS.
     Quando as rotas existirem, troque este objeto pelo retorno da API. */
  const dadosHome = {
    cursosEmAndamento: 1,
    exerciciosConcluidos: 8,
    cursoAtual: {
      titulo: 'Lógica de Programação',
      descricao: 'Aprenda os fundamentos da lógica e programe com confiança.',
      capa: 'logica',   // arquivo em img/cursos/ (sem .jpg)
      progresso: 65     // 0 a 100
    },
    nivel: {
      numero: 7,
      titulo: 'Desenvolvedor Júnior',
      xp: 1240,
      xpProximo: 2000   // XP necessário para o próximo nível
    },
    sequencia: {
      dias: 5,
      semana: [true, true, true, true, true, false, false]  // segunda a domingo
    },
    conquistas: [
      { icone: 'codigo',  titulo: 'Primeiro código', desc: 'Resolveu o 1º exercício' },
      { icone: 'estrela', titulo: 'Nível 5',         desc: 'Chegou ao nível 5' },
      { icone: 'chama',   titulo: 'Maratonista',     desc: '7 dias seguidos', atual: 5, meta: 7 },
      { icone: 'check',   titulo: 'Dez exercícios',  desc: 'Conclua 10 exercícios', atual: 8, meta: 10 }
    ]
  };

  const ICONES_CONQUISTA = {
    codigo:  '<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13.5 5l-3 14"/>',
    estrela: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>',
    chama:   '<path d="M12 2.5c.6 3.2 4.5 5.4 4.5 10a4.5 4.5 0 01-9 0c0-1.7.8-2.8 1.7-3.7.3 1.2.9 1.9 1.6 2.2C10.4 8.2 10.6 5 12 2.5z"/>',
    check:   '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  };

  const $ = (id) => document.getElementById(id);
  const plural = (n, um, varios) => (n === 1 ? um : varios);

  function mostrarDados(d) {
    // números rápidos
    NivelDevUI.contar($('stat-cursos'), d.cursosEmAndamento);
    $('stat-cursos-rotulo').textContent = plural(d.cursosEmAndamento, 'Curso em andamento', 'Cursos em andamento');
    NivelDevUI.contar($('stat-exercicios'), d.exerciciosConcluidos);
    $('stat-exercicios-rotulo').textContent = plural(d.exerciciosConcluidos, 'Exercício concluído', 'Exercícios concluídos');

    // curso atual
    const c = d.cursoAtual;
    $('curso-titulo').textContent = c.titulo;
    $('curso-desc').textContent = c.descricao;
    $('curso-capa').src = 'img/cursos/' + c.capa + '.jpg';
    NivelDevUI.contar($('curso-pct'), c.progresso);
    $('curso-barra').setAttribute('aria-valuenow', String(c.progresso));

    // nível e XP
    const n = d.nivel;
    const pctXp = Math.min(100, Math.round((n.xp / n.xpProximo) * 100));
    $('nivel-numero').textContent = n.numero;
    $('nivel-numero-txt').textContent = n.numero;
    $('nivel-proximo').textContent = n.numero + 1;
    $('nivel-titulo').textContent = n.titulo;
    $('xp-total').textContent = n.xpProximo.toLocaleString('pt-BR');
    $('xp-falta').textContent = Math.max(0, n.xpProximo - n.xp).toLocaleString('pt-BR');
    $('xp-barra').setAttribute('aria-valuenow', String(pctXp));
    NivelDevUI.contar($('xp-atual'), n.xp, 1100);

    // sequência da semana (a bolinha de hoje ganha um anel)
    const hoje = (new Date().getDay() + 6) % 7; // 0 = segunda
    const letras = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    $('seq-dias').textContent = d.sequencia.dias;
    $('seq-semana').innerHTML = d.sequencia.semana.map((feito, i) => `
      <li class="${feito ? 'is-feito' : ''} ${i === hoje ? 'is-hoje' : ''}">
        <span class="dia"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
        ${letras[i]}
      </li>`).join('');

    // conquistas (as que têm "meta" ainda estão bloqueadas)
    $('conquistas').innerHTML = d.conquistas.map((q) => {
      const bloqueada = q.meta && q.atual < q.meta;
      const icone = ICONES_CONQUISTA[bloqueada ? 'cadeado' : q.icone];
      return `
        <article class="conquista ${bloqueada ? 'is-bloqueada' : ''}">
          <span class="conquista-medalha"><svg viewBox="0 0 24 24" aria-hidden="true">${icone}</svg></span>
          <strong>${q.titulo}</strong>
          <span class="conquista-desc">${bloqueada ? q.atual + ' de ' + q.meta : q.desc}</span>
          ${bloqueada ? `<span class="conquista-prog"><span style="width:${(q.atual / q.meta) * 100}%"></span></span>` : ''}
        </article>`;
    }).join('');

    // barras e anel crescem com animação (pequeno atraso para a transição valer)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $('curso-barra-fill').style.width = c.progresso + '%';
      $('xp-barra-fill').style.width = pctXp + '%';
      $('nivel-anel').style.strokeDashoffset = String(100 - pctXp);
    }));
  }

  /* ---------- 2) NAVEGAÇÃO ---------- */
  const TITULOS = {
    inicio: 'Início',
    cursos: 'Cursos',
    exercicios: 'Exercícios',
    progresso: 'Meu Progresso',
    perfil: 'Meu Perfil',
    ajustes: 'Ajustes'
  };

  // telas liberadas (as outras mostram "em desenvolvimento").
  // Meu Perfil e Meu Progresso estão prontos no código, mas escondidos por enquanto:
  // para liberar de novo, é só acrescentar 'perfil' e 'progresso' nesta lista.
  const TELAS_PRONTAS = ['inicio', 'ajustes'];

  function irPara() {
    const nome = window.location.hash.replace('#', '');

    // Cursos agora tem tela própria (links antigos com #cursos continuam funcionando)
    if (nome === 'cursos') {
      window.location.replace('cursos.html');
      return;
    }

    const tela = TITULOS[nome] ? nome : 'inicio';

    document.querySelectorAll('.app-nav-item').forEach((item) => {
      const ativo = item.dataset.view === tela;
      item.classList.toggle('is-active', ativo);
      if (ativo) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    const emDev = TELAS_PRONTAS.indexOf(tela) === -1;
    TELAS_PRONTAS.forEach((nomeTela) => { $('view-' + nomeTela).hidden = nomeTela !== tela; });
    $('view-dev').hidden = !emDev;
    if (emDev) $('dev-titulo').textContent = TITULOS[tela] + ' — em desenvolvimento';
    document.title = TITULOS[tela] + ' — NívelDev';
    window.scrollTo(0, 0);
  }

  /* ---------- INÍCIO ---------- */
  NivelDevLayout.usuario((usuario) => {
    const nome = (usuario && usuario.nome) || '';
    $('hero-nome').textContent = nome.split(' ')[0] || 'aluno'; // textContent: sem risco de HTML injetado
  });

  mostrarDados(dadosHome);
  window.addEventListener('hashchange', irPara);
  irPara();
})();
