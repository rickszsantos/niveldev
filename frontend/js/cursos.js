/* ============================================================
   NívelDev — tela de Cursos (cursos.html)
   Banner com pontinhos + carrosséis: "Cursos em Destaque",
   "Mais Procurados", "Desenvolvimento Full Stack" e
   "Recomendados para você".
   Menu, topo, usuário e proteção da página: js/layout.js.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  /* ---------- DADOS ----------
     ATENÇÃO: ainda não existe API de cursos no back-end, então estes
     cursos são EXEMPLOS. Quando a rota existir, troque os arrays pelo
     retorno da API (mesmos campos).
       selo:   texto da etiqueta no canto da capa (opcional)
       logo:   desenho da capa (ver LOGOS)   cor: degradê da capa (ver CORES)
       nota / avaliacoes: média e quantidade de avaliações
       alunos: texto ("100k+")   preco: em reais */
  const SECOES = [
    { id: 'destaque', titulo: 'Cursos em Destaque', icone: 'estrela', cursos: [
      { id: 'python',     titulo: 'Python do Zero ao Avançado',   desc: 'Aprenda Python desde o básico até recursos avançados.', logo: 'python', cor: 'marinho',  nota: 4.9, avaliacoes: '12k', alunos: '100k+', preco: 79.90, selo: 'Mais Popular' },
      { id: 'javascript', titulo: 'JavaScript Essencial',         desc: 'Domine a linguagem que move a web.',                    logo: 'js',     cor: 'amarelo',  nota: 4.8, avaliacoes: '9k',  alunos: '80k+',  preco: 69.90, selo: 'Em Alta' },
      { id: 'web',        titulo: 'Desenvolvimento Web Completo', desc: 'Crie sites modernos com HTML, CSS e JavaScript.',       logo: 'web',    cor: 'roxo',     nota: 4.9, avaliacoes: '15k', alunos: '120k+', preco: 89.90, selo: 'Novo' },
      { id: 'java',       titulo: 'Java Fundamentals',            desc: 'Aprenda Java do zero com projetos práticos.',           logo: 'java',   cor: 'marinho',  nota: 4.8, avaliacoes: '8k',  alunos: '70k+',  preco: 89.90 },
      { id: 'dados',   titulo: 'Python para Ciência de Dados', desc: 'Analise dados com Python, Pandas e gráficos.',      logo: 'python', cor: 'azul2',   nota: 4.8, avaliacoes: '6k', alunos: '55k+', preco: 84.90 },
    ] },
    { id: 'procurados', titulo: 'Mais Procurados', icone: 'chama', cursos: [
      { id: 'cpp',    titulo: 'C++ do Zero ao Avançado', desc: 'Aprenda C++ de forma simples e prática.',           logo: 'cpp',    cor: 'roxo3',   nota: 4.7, avaliacoes: '5k', alunos: '50k+', preco: 69.90 },
      { id: 'nodejs', titulo: 'Node.js na Prática',      desc: 'Construa APIs e aplicações com Node.js.',           logo: 'node',   cor: 'verde',   nota: 4.9, avaliacoes: '8k', alunos: '60k+', preco: 79.90 },
      { id: 'git',    titulo: 'Git e GitHub',            desc: 'Controle versões e colabore em seus projetos.',     logo: 'git',    cor: 'laranja', nota: 4.8, avaliacoes: '6k', alunos: '60k+', preco: 49.90 },
      { id: 'docker', titulo: 'Docker Essencial',        desc: 'Aprenda a usar containers com Docker.',             logo: 'docker', cor: 'azul',    nota: 4.7, avaliacoes: '4k', alunos: '35k+', preco: 59.90 },
      { id: 'testes',  titulo: 'Testes Automatizados',          desc: 'Garanta a qualidade do código com testes.',         logo: 'codigo', cor: 'escuro',  nota: 4.7, avaliacoes: '3k', alunos: '30k+', preco: 59.90 },
    ] },
    { id: 'fullstack', titulo: 'Desenvolvimento Full Stack', icone: 'camadas', cursos: [
      { id: 'react',    titulo: 'React do Zero ao Avançado',     desc: 'Crie interfaces modernas com React.',                  logo: 'react',    cor: 'escuro',   nota: 4.8, avaliacoes: '10k', alunos: '90k+', preco: 79.90 },
      { id: 'spring',   titulo: 'Spring Boot na Prática',        desc: 'Desenvolva APIs robustas com Spring Boot.',            logo: 'spring',   cor: 'verde2',   nota: 4.9, avaliacoes: '7k',  alunos: '70k+', preco: 89.90 },
      { id: 'postgres', titulo: 'Banco de Dados com PostgreSQL', desc: 'Aprenda a trabalhar com bancos de dados PostgreSQL.',  logo: 'banco',    cor: 'azul2',    nota: 4.8, avaliacoes: '5k',  alunos: '60k+', preco: 69.90 },
      { id: 'angular',  titulo: 'Desenvolvimento Web Moderno',   desc: 'Construa aplicações completas com Angular.',           logo: 'angular',  cor: 'vermelho', nota: 4.7, avaliacoes: '5k',  alunos: '50k+', preco: 79.90 },
      { id: 'next',    titulo: 'Next.js Moderno',               desc: 'Crie aplicações React rápidas e otimizadas.',       logo: 'react',  cor: 'roxo3',   nota: 4.8, avaliacoes: '4k', alunos: '40k+', preco: 79.90 },
    ] },
    { id: 'recomendados', titulo: 'Recomendados para você', icone: 'trofeu', cursos: [
      { id: 'typescript', titulo: 'TypeScript na Prática',          desc: 'Escreva JavaScript mais seguro e escalável.',        logo: 'ts',     cor: 'azul',   nota: 4.8, avaliacoes: '6k', alunos: '45k+', preco: 69.90 },
      { id: 'algoritmos', titulo: 'Algoritmos e Lógica',            desc: 'Desenvolva seu raciocínio lógico com algoritmos.',   logo: 'codigo', cor: 'roxo2',  nota: 4.8, avaliacoes: '6k', alunos: '55k+', preco: 59.90 },
      { id: 'linux',      titulo: 'Linux para Desenvolvedores',     desc: 'Aprenda os principais comandos e ferramentas.',      logo: 'linux',  cor: 'verde',  nota: 4.7, avaliacoes: '5k', alunos: '40k+', preco: 49.90 },
      { id: 'sql',        titulo: 'SQL na Prática',                 desc: 'Consulte e analise dados com SQL de verdade.',       logo: 'banco',  cor: 'azul3',  nota: 4.8, avaliacoes: '7k', alunos: '65k+', preco: 54.90 },
      { id: 'estruturas', titulo: 'Estruturas de Dados',        desc: 'Listas, pilhas, filas, árvores e muito mais.',      logo: 'codigo', cor: 'roxo',    nota: 4.8, avaliacoes: '5k', alunos: '45k+', preco: 64.90 },
    ] },
  ];

  const BANNERS = [
    { t: 'Aprenda, Pratique,<br><span>Evolua.</span>', p: 'Cursos completos para você dominar<br>a tecnologia e impulsionar sua carreira.', b: 'Explorar cursos', alvo: 'cr-destaque-titulo' },
    { t: 'Do zero ao<br><span>primeiro emprego.</span>', p: 'Trilhas práticas, projetos reais<br>e exercícios para treinar todo dia.', b: 'Ver mais procurados', alvo: 'cr-procurados-titulo' },
    { t: 'Construa projetos<br><span>Full Stack.</span>', p: 'Front-end, back-end e banco de dados<br>em um só lugar.', b: 'Ver Full Stack', alvo: 'cr-fullstack-titulo' },
  ];

  // degradês das capas (fixos nos dois temas)
  const CORES = {
    marinho:  ['#0b1f4f', '#16336f'],
    amarelo:  ['#f5b800', '#ffd84d'],
    roxo:     ['#6a3be0', '#b583f7'],
    roxo2:    ['#7440e0', '#b07af5'],
    roxo3:    ['#5b3ad6', '#8f6df0'],
    azul:     ['#1556e6', '#3d8bff'],
    azul2:    ['#1b4fd8', '#4f9bff'],
    azul3:    ['#0f3fc4', '#2f7bff'],
    verde:    ['#2fa84f', '#55d27a'],
    verde2:   ['#35b52f', '#8be04a'],
    laranja:  ['#ff5f15', '#ff8a3d'],
    vermelho: ['#e11d48', '#ff4d6d'],
    escuro:   ['#0a1830', '#13294f'],
  };

  // desenhos simples das capas (não são as marcas oficiais)
  const LOGOS = {
    python: '<g stroke="#fff" stroke-width="3" stroke-linejoin="round"><rect x="8" y="6" width="32" height="34" rx="13" fill="#2f6df0"/><rect x="24" y="24" width="32" height="34" rx="13" fill="#ffc83d"/></g><circle cx="20" cy="18" r="2.6" fill="#fff"/><circle cx="44" cy="46" r="2.6" fill="#fff"/>',
    js:     '<rect x="6" y="6" width="52" height="52" rx="6" fill="#1b1b1b"/><text x="52" y="51" text-anchor="end" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="27" fill="#ffd400">JS</text>',
    web:    '<g font-family="Space Grotesk, sans-serif" font-weight="700" font-size="17" text-anchor="middle" fill="#fff"><path d="M2 4h26l-2.4 32L15 40 4.4 36z" fill="#ef4f23" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="15" y="30">5</text><path d="M34 4h26l-2.4 32L47 40 36.4 36z" fill="#2b86f2" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="47" y="30">3</text><path d="M66 4h26l-2.4 32L79 40 68.4 36z" fill="#f2b705" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="79" y="30">5</text></g>',
    java:   '<path d="M34 6c8 8-8 12-2 22" fill="none" stroke="#ff7a3d" stroke-width="3.4" stroke-linecap="round"/><path d="M22 36h22c0 8-4 14-11 14s-11-6-11-14z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/><path d="M44 39c7 0 7 8 0 8M18 56h28" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>',
    banco:  '<g fill="#fff" stroke="#3b82f6" stroke-width="1.6"><ellipse cx="32" cy="13" rx="21" ry="7"/><path d="M11 13v11c0 4 9.4 7 21 7s21-3 21-7V13c0 4-9.4 7-21 7s-21-3-21-7z"/><path d="M11 27v11c0 4 9.4 7 21 7s21-3 21-7V27c0 4-9.4 7-21 7s-21-3-21-7z"/><path d="M11 41v9c0 4 9.4 7 21 7s21-3 21-7v-9c0 4-9.4 7-21 7s-21-3-21-7z"/></g>',
    codigo: '<path d="M20 16L6 32l14 16M44 16l14 16-14 16M37 10L27 54" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
    linux:  '<rect x="6" y="9" width="52" height="46" rx="9" fill="#0d2b20"/><path d="M17 24l9 8-9 8" fill="none" stroke="#3ddc97" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 42h14" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
    git:    '<rect x="11" y="11" width="42" height="42" rx="8" transform="rotate(45 32 32)" fill="#fff"/><g stroke="#f0541a" stroke-width="4" fill="none" stroke-linecap="round"><path d="M25 22v20M25 31c8 0 12-3 15-9"/></g><g fill="#f0541a"><circle cx="25" cy="22" r="4.4"/><circle cx="25" cy="42" r="4.4"/><circle cx="40" cy="22" r="4.4"/></g>',
    node:   '<path d="M32 5l23 13v28L32 59 9 46V18z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><text x="32" y="39" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="19" fill="#fff">JS</text>',
    cpp:    '<path d="M32 4l24 14v28L32 60 8 46V18z" fill="#2563eb" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><text x="32" y="39" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="20" fill="#fff">C++</text>',
    docker: '<g fill="#fff"><rect x="10" y="26" width="9" height="8" rx="1"/><rect x="21" y="26" width="9" height="8" rx="1"/><rect x="32" y="26" width="9" height="8" rx="1"/><rect x="21" y="16" width="9" height="8" rx="1"/><rect x="32" y="16" width="9" height="8" rx="1"/><rect x="32" y="6" width="9" height="8" rx="1"/></g><path d="M6 38c0 12 10 18 22 18 14 0 22-8 26-20 3 0 6-1 7-4-3-2-6-2-8 0-1-4-5-5-5-5-1 4 0 6 1 8H6z" fill="#fff"/>',
    react:  '<g fill="none" stroke="#5fd9f0" stroke-width="3"><ellipse cx="32" cy="32" rx="26" ry="10"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="4.5" fill="#5fd9f0"/>',
    spring: '<circle cx="32" cy="32" r="27" fill="#fff"/><path d="M46 17c-12-2-24 3-27 15-2 8 2 14 8 15 9 2 19-4 20-15 0-5-1-11-1-15z" fill="#4cb82f"/><path d="M24 44c8-4 14-12 17-21" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
    angular:'<path d="M32 5l24 8-4 32-20 14-20-14-4-32z" fill="#fff"/><path d="M32 14L19 44h5l2.6-7h10.8l2.6 7h5L32 14zm0 9l3.8 10h-7.6L32 23z" fill="#e11d48"/>',
    ts:     '<rect x="6" y="6" width="52" height="52" rx="6" fill="#fff"/><text x="52" y="52" text-anchor="end" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="26" fill="#1b5bd8">TS</text>',
  };

  const ICONES_SECAO = {
    estrela: '<svg class="cr-sec-icone azul" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 17.4l-5.8 3.2 1.3-6.5L2.7 9.6l6.5-.8L12 2.8z"/></svg>',
    chama:   '<svg class="cr-sec-icone laranja" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3.4 5.5 5.6 5.5 11a5.5 5.5 0 01-11 0c0-2 .9-3.5 2-4.7.2 1.5.9 2.4 1.9 2.7C10 8 10.6 4.6 12 2z"/></svg>',
    camadas: '<svg class="cr-sec-icone azul" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 4.8-9 4.8-9-4.8L12 3z"/><path d="M3.5 12.2L12 16.7l8.5-4.5M3.5 16.4L12 21l8.5-4.6" fill="none" stroke="#1f6bff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trofeu:  '<svg class="cr-sec-icone dourado" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v5a5 5 0 01-10 0V3z"/><path d="M7 5H3.5c0 3 1.3 4.6 3.8 5M17 5h3.5c0 3-1.3 4.6-3.8 5" fill="none" stroke="#f5b301" stroke-width="2"/><path d="M10.5 13h3v3h-3zM8 20h8v-2.5H8z"/></svg>',
  };

  const ESTRELA = '<svg class="cr-estrela" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 17.4l-5.8 3.2 1.3-6.5L2.7 9.6l6.5-.8L12 2.8z"/></svg>';
  const PESSOAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5"/><path d="M16 5.6a3.2 3.2 0 010 5.8M17.5 14c2.2.5 3.5 2.2 3.5 5"/></svg>';
  const SETA_E = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>';
  const SETA_D = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6"/></svg>';

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reais = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const nota = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1 });

  /* ---------- CARDS E SEÇÕES ---------- */
  function cardCurso(c) {
    const [c1, c2] = CORES[c.cor] || CORES.azul;
    const largo = c.logo === 'web';
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
              <span class="cr-alunos" aria-label="${esc(c.alunos)} alunos">${PESSOAS}${esc(c.alunos)} alunos</span>
            </div>
            <div class="cr-rodape">
              <strong class="cr-preco">${reais(c.preco)}</strong>
              <button type="button" class="cr-acessar" data-curso="${c.id}" aria-label="Acessar curso ${esc(c.titulo)}">Acessar curso</button>
            </div>
          </div>
        </article>
      </li>`;
  }

  function htmlSecao(s) {
    return `
      <section aria-labelledby="cr-${s.id}-titulo">
        <div class="cr-sec-topo">
          <h2 class="cr-sec-titulo" id="cr-${s.id}-titulo" tabindex="-1">${ICONES_SECAO[s.icone]}${esc(s.titulo)}</h2>
          <div class="cr-setas">
            <button type="button" class="cr-seta" data-dir="-1" aria-label="Cursos anteriores de ${esc(s.titulo)}">${SETA_E}</button>
            <button type="button" class="cr-seta" data-dir="1" aria-label="Próximos cursos de ${esc(s.titulo)}">${SETA_D}</button>
          </div>
        </div>
        <ul class="cr-trilho" id="cr-${s.id}">${s.cursos.map(cardCurso).join('')}</ul>
      </section>`;
  }

  document.getElementById('cr-secoes').innerHTML = SECOES.map(htmlSecao).join('');

  /* ---------- SETAS DOS CARROSSÉIS ---------- */
  function ligarSetas(secao) {
    const trilho = secao.querySelector('.cr-trilho');
    const [ant, prox] = secao.querySelectorAll('.cr-seta');

    const atualizar = () => {
      ant.disabled = trilho.scrollLeft <= 2;
      prox.disabled = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 2;
    };

    [ant, prox].forEach((b) => b.addEventListener('click', () => {
      trilho.scrollBy({ left: Number(b.dataset.dir) * (trilho.clientWidth + 18), behavior: 'smooth' });
    }));

    trilho.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    atualizar();
  }

  document.querySelectorAll('#cr-secoes section').forEach(ligarSetas);

  /* ---------- BANNER (pontinhos + troca automática) ---------- */
  const $ = (id) => document.getElementById(id);
  const pontos = $('cr-hero-pontos');
  let atual = 0;
  let timer = null;

  pontos.innerHTML = BANNERS.map((_, i) => `<button type="button" data-i="${i}" aria-label="Destaque ${i + 1} de ${BANNERS.length}"></button>`).join('');

  function mostrarBanner(i) {
    atual = i;
    const b = BANNERS[i];
    $('cr-hero-titulo').innerHTML = b.t;
    $('cr-hero-sub').innerHTML = b.p;
    $('cr-hero-btn').firstChild.nodeValue = b.b + ' ';
    $('cr-hero-btn').setAttribute('href', '#' + b.alvo);
    pontos.querySelectorAll('button').forEach((btn, k) => btn.setAttribute('aria-current', String(k === i)));
  }

  function agendar() {
    clearInterval(timer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(() => mostrarBanner((atual + 1) % BANNERS.length), 6000);
  }

  pontos.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-i]');
    if (!btn) return;
    mostrarBanner(Number(btn.dataset.i));
    agendar();
  });

  // o botão do banner rola até a seção e leva o foco para o título dela
  $('cr-hero-btn').addEventListener('click', (e) => {
    const alvo = document.getElementById(BANNERS[atual].alvo);
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    alvo.focus({ preventScroll: true });
  });

  mostrarBanner(0);
  agendar();

  /* ---------- ACESSAR CURSO ---------- */
  // TODO: quando existir a API de matrículas/pagamento, troque o aviso pela navegação de verdade
  document.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-curso]');
    if (!botao) return;
    const curso = SECOES.flatMap((s) => s.cursos).find((c) => c.id === botao.dataset.curso);
    NivelDevUI.toast('O curso “' + curso.titulo + '” chega em breve.', 'info');
  });
})();
