/* ============================================================
   NívelDev — tela de Cursos (cursos.html)
   Vitrine de cursos (estilo marketplace): "Cursos em Destaque" e
   "Mais Cursos" com ordenação. A página rola para baixo.
   Menu, topo, usuário e proteção da página: js/layout.js.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  /* ---------- DADOS ----------
     ATENÇÃO: ainda não existe API de cursos no back-end, então estes
     cursos são EXEMPLOS. Quando a rota existir, troque este array pelo
     retorno da API (mesmos campos).
       destaque:  true = aparece em "Cursos em Destaque" (com selo)
       selo:      texto da etiqueta no canto da capa
       logo:      desenho da capa (ver LOGOS)   cor: degradê da capa (ver CORES)
       nota / avaliacoes: média e quantidade de avaliações
       horas:     carga horária     preco: em reais
       progresso: 0 a 100 (barra só aparece em destaque, se o aluno já começou)
       data:      lançamento (para "Mais recentes") */
  const cursos = [
    { id: 'python',     titulo: 'Python do Zero ao Avançado',        desc: 'Aprenda Python desde o básico até recursos avançados.', logo: 'python', cor: 'azul',     nota: 4.9, avaliacoes: '12k', horas: 40, preco: 79.90, progresso: 60, destaque: true, selo: 'Mais Popular', data: '2026-06-10' },
    { id: 'javascript', titulo: 'JavaScript Essencial',              desc: 'Domine a linguagem que move a web.',                     logo: 'js',     cor: 'amarelo',  nota: 4.8, avaliacoes: '9k',  horas: 35, preco: 69.90, progresso: 20, destaque: true, selo: 'Em Alta',      data: '2026-07-02' },
    { id: 'web',        titulo: 'Desenvolvimento Web Completo',      desc: 'Crie sites modernos com HTML, CSS e JavaScript.',        logo: 'web',    cor: 'roxo',     nota: 4.9, avaliacoes: '15k', horas: 50, preco: 89.90, progresso: 75, destaque: true, selo: 'Novo',         data: '2026-10-20' },
    { id: 'postgres',   titulo: 'Banco de Dados com PostgreSQL',     desc: 'Aprenda a trabalhar com bancos de dados usando PostgreSQL.', logo: 'banco', cor: 'azul2',  nota: 4.7, avaliacoes: '7k',  horas: 30, preco: 69.90, progresso: 0, data: '2026-09-15' },
    { id: 'algoritmos', titulo: 'Algoritmos e Lógica de Programação', desc: 'Desenvolva seu raciocínio lógico com algoritmos.',      logo: 'codigo', cor: 'roxo2',    nota: 4.8, avaliacoes: '6k',  horas: 25, preco: 59.90, progresso: 0, data: '2026-05-04' },
    { id: 'linux',      titulo: 'Linux para Desenvolvedores',        desc: 'Aprenda os principais comandos e ferramentas do Linux.', logo: 'linux',  cor: 'verde',    nota: 4.7, avaliacoes: '5k',  horas: 20, preco: 49.90, progresso: 0, data: '2026-04-18' },
    { id: 'git',        titulo: 'Git e GitHub',                      desc: 'Controle versões e colabore em seus projetos.',          logo: 'git',    cor: 'laranja',  nota: 4.8, avaliacoes: '6k',  horas: 18, preco: 49.90, progresso: 0, data: '2026-08-08' },
    { id: 'nodejs',     titulo: 'Node.js na Prática',                desc: 'Construa APIs e aplicações com Node.js.',                logo: 'node',   cor: 'verde2',   nota: 4.9, avaliacoes: '8k',  horas: 40, preco: 79.90, progresso: 0, data: '2026-10-01' },
    { id: 'cpp',        titulo: 'C++ do Zero ao Avançado',           desc: 'Aprenda C++ com foco na prática e projetos reais.',      logo: 'cpp',    cor: 'roxo3',    nota: 4.7, avaliacoes: '5k',  horas: 35, preco: 69.90, progresso: 0, data: '2026-03-12' },
  ];

  const ORDENS = [
    ['recentes', 'Ordenar por: Mais recentes', (a, b) => b.data.localeCompare(a.data)],
    ['nota',     'Ordenar por: Mais bem avaliados', (a, b) => b.nota - a.nota],
    ['menor',    'Ordenar por: Menor preço', (a, b) => a.preco - b.preco],
    ['maior',    'Ordenar por: Maior preço', (a, b) => b.preco - a.preco],
  ];

  // degradês das capas (fixos nos dois temas)
  const CORES = {
    azul:    ['#1556e6', '#3d8bff'],
    amarelo: ['#f5b800', '#ffd84d'],
    roxo:    ['#7a45e6', '#b583f7'],
    azul2:   ['#1f5cf0', '#4a9bff'],
    roxo2:   ['#7440e0', '#b07af5'],
    verde:   ['#10b981', '#3ddc97'],
    laranja: ['#ff5f15', '#ff8a3d'],
    verde2:  ['#2fc46e', '#7beaa6'],
    roxo3:   ['#6a43e0', '#a477f5'],
  };

  // desenhos simples das capas (não são as marcas oficiais)
  const LOGOS = {
    python: '<g stroke="#fff" stroke-width="3" stroke-linejoin="round"><rect x="8" y="6" width="32" height="34" rx="13" fill="#2f6df0"/><rect x="24" y="24" width="32" height="34" rx="13" fill="#ffc83d"/></g><circle cx="20" cy="18" r="2.6" fill="#fff"/><circle cx="44" cy="46" r="2.6" fill="#fff"/>',
    js:     '<rect x="6" y="6" width="52" height="52" rx="6" fill="#1b1b1b"/><text x="52" y="51" text-anchor="end" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="27" fill="#ffd400">JS</text>',
    web:    '<g font-family="Space Grotesk, sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#fff"><path d="M2 4h26l-2.4 32L15 40 4.4 36z" fill="#ef4f23" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="15" y="30">5</text><path d="M34 4h26l-2.4 32L47 40 36.4 36z" fill="#2b86f2" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="47" y="30">3</text><path d="M66 4h26l-2.4 32L79 40 68.4 36z" fill="#f2b705" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="79" y="30">5</text></g>',
    banco:  '<g fill="#fff" stroke="#3b82f6" stroke-width="1.6"><ellipse cx="32" cy="13" rx="21" ry="7"/><path d="M11 13v11c0 4 9.4 7 21 7s21-3 21-7V13c0 4-9.4 7-21 7s-21-3-21-7z"/><path d="M11 27v11c0 4 9.4 7 21 7s21-3 21-7V27c0 4-9.4 7-21 7s-21-3-21-7z"/><path d="M11 41v9c0 4 9.4 7 21 7s21-3 21-7v-9c0 4-9.4 7-21 7s-21-3-21-7z"/></g>',
    codigo: '<path d="M20 16L6 32l14 16M44 16l14 16-14 16M37 10L27 54" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
    linux:  '<rect x="6" y="9" width="52" height="46" rx="9" fill="#0d2b20"/><path d="M17 24l9 8-9 8" fill="none" stroke="#3ddc97" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 42h14" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
    git:    '<rect x="11" y="11" width="42" height="42" rx="8" transform="rotate(45 32 32)" fill="#fff"/><g stroke="#f0541a" stroke-width="4" fill="none" stroke-linecap="round"><path d="M25 22v20M25 31c8 0 12-3 15-9"/></g><g fill="#f0541a"><circle cx="25" cy="22" r="4.4"/><circle cx="25" cy="42" r="4.4"/><circle cx="40" cy="22" r="4.4"/></g>',
    node:   '<path d="M32 5l23 13v28L32 59 9 46V18z" fill="none" stroke="#10432b" stroke-width="5" stroke-linejoin="round"/><text x="32" y="39" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="19" fill="#10432b">JS</text>',
    cpp:    '<path d="M32 4l24 14v28L32 60 8 46V18z" fill="#2563eb" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><text x="32" y="39" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="20" fill="#fff">C++</text>',
  };

  /* ---------- ELEMENTOS ---------- */
  const $ = (id) => document.getElementById(id);
  const gradeDestaque = $('cr-destaque');
  const gradeMais = $('cr-mais');
  const selOrdem = $('cr-ordem');

  const ESTRELA = '<svg class="cr-estrela" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 17.4l-5.8 3.2 1.3-6.5L2.7 9.6l6.5-.8L12 2.8z"/></svg>';
  const RELOGIO = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const nota = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1 });

  /* ---------- RENDERIZAÇÃO ---------- */
  function cardCurso(c) {
    const [c1, c2] = CORES[c.cor] || CORES.azul;
    const largo = c.logo === 'web';
    const comecou = c.destaque && c.progresso > 0;
    return `
      <li>
        <article class="cr-card">
          <div class="cr-topo" style="--c1:${c1};--c2:${c2}">
            ${c.selo ? `<span class="cr-selo">${esc(c.selo)}</span>` : ''}
            <svg class="cr-logo${largo ? ' cr-logo--largo' : ''}" viewBox="0 0 ${largo ? '94 44' : '64 64'}" aria-hidden="true" focusable="false">${LOGOS[c.logo] || ''}</svg>
          </div>
          <div class="cr-corpo">
            <h3>${esc(c.titulo)}</h3>
            <p>${esc(c.desc)}</p>
            <div class="cr-meta">
              <span class="cr-nota" aria-label="Nota ${nota(c.nota)} de 5, ${esc(c.avaliacoes)} avaliações">${ESTRELA}<b>${nota(c.nota)}</b> (${esc(c.avaliacoes)} avaliações)</span>
              <span class="cr-horas" aria-label="${c.horas} horas">${RELOGIO}${c.horas}h</span>
            </div>
            ${comecou ? `
            <div class="cr-progresso">
              <div class="app-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progresso}" aria-label="Seu progresso em ${esc(c.titulo)}"><span data-w="${c.progresso}"></span></div>
              <strong>${c.progresso}%</strong>
            </div>` : ''}
            <div class="cr-rodape">
              <strong class="cr-preco">${reais(c.preco)}</strong>
              <button type="button" class="cr-inscrever" data-curso="${c.id}" aria-label="Inscrever-se em ${esc(c.titulo)}">Inscrever-se</button>
            </div>
          </div>
        </article>
      </li>`;
  }

  function animarBarras() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('.cr-progresso .app-barra span[data-w]').forEach((el) => { el.style.width = el.dataset.w + '%'; });
    }));
  }

  function desenharMais() {
    const ordem = ORDENS.find((o) => o[0] === selOrdem.value) || ORDENS[0];
    const lista = cursos.filter((c) => !c.destaque).sort(ordem[2]);
    gradeMais.innerHTML = lista.map(cardCurso).join('');
  }

  selOrdem.innerHTML = ORDENS.map((o) => `<option value="${o[0]}">${o[1]}</option>`).join('');
  selOrdem.addEventListener('change', desenharMais);

  gradeDestaque.innerHTML = cursos.filter((c) => c.destaque).map(cardCurso).join('');
  desenharMais();
  animarBarras();

  // TODO: quando existir a API de matrículas/pagamento, troque o aviso pela inscrição de verdade
  document.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-curso]');
    if (!botao) return;
    const curso = cursos.find((c) => c.id === botao.dataset.curso);
    NivelDevUI.toast('A inscrição em “' + curso.titulo + '” chega em breve.', 'info');
  });
})();
