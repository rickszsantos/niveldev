/* ============================================================
   NívelDev — script inicial
   1) Lista de cursos (a grade da home é montada a partir dela)
   2) Cabeçalho: Entrar / Inscreva-se (ou nome do usuário e Sair, se logado)
   ============================================================ */

/* ---------- 1) CURSOS ----------
   Para adicionar um curso, copie um bloco abaixo e mude os dados.
   ATENÇÃO: nota, avaliações e preços são só exemplos — troque
   pelos dados reais (ou pelo retorno da API do back-end).
   preco: 0 aparece como "Grátis".
   capa: nome do arquivo em img/cursos/ (sem .jpg).
*/
const cursos = [
  { titulo: 'Python do Zero', autor: 'Equipe NívelDev', nota: 4.8, avaliacoes: 1240,
    horas: 12, aulas: 64, nivel: 'Iniciante', preco: 0, selo: 'Mais popular',
    capa: 'python' },

  { titulo: 'JavaScript Essencial', autor: 'Equipe NívelDev', nota: 4.7, avaliacoes: 980,
    horas: 15, aulas: 82, nivel: 'Iniciante', preco: 24.9, selo: '',
    capa: 'javascript' },

  { titulo: 'HTML e CSS na Prática', autor: 'Equipe NívelDev', nota: 4.6, avaliacoes: 760,
    horas: 10, aulas: 48, nivel: 'Iniciante', preco: 0, selo: '',
    capa: 'html-css' },

  { titulo: 'Lógica de Programação', autor: 'Equipe NívelDev', nota: 4.9, avaliacoes: 1510,
    horas: 8, aulas: 40, nivel: 'Iniciante', preco: 24.9, selo: 'Novo',
    capa: 'logica' },

  { titulo: 'SQL e Banco de Dados', autor: 'Equipe NívelDev', nota: 4.7, avaliacoes: 540,
    horas: 14, aulas: 70, nivel: 'Intermediário', preco: 39.9, selo: '',
    capa: 'sql' },

  { titulo: 'Git e GitHub para Iniciantes', autor: 'Equipe NívelDev', nota: 4.8, avaliacoes: 690,
    horas: 6, aulas: 30, nivel: 'Iniciante', preco: 0, selo: '',
    capa: 'git' },

  { titulo: 'APIs com Node.js', autor: 'Equipe NívelDev', nota: 4.6, avaliacoes: 320,
    horas: 18, aulas: 90, nivel: 'Intermediário', preco: 49.9, selo: '',
    capa: 'nodejs' },

  { titulo: 'Algoritmos e Estruturas de Dados', autor: 'Equipe NívelDev', nota: 4.9, avaliacoes: 410,
    horas: 20, aulas: 96, nivel: 'Avançado', preco: 49.9, selo: '',
    capa: 'algoritmos' }
];

const formatarPreco = (valor) =>
  valor === 0
    ? '<span class="curso-preco curso-preco-gratis">Grátis</span>'
    : '<span class="curso-preco">' + valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + '</span>';

const estrelas = (nota) => {
  const cheias = Math.round(nota);
  return '★'.repeat(cheias) + '☆'.repeat(5 - cheias);
};

function cardCurso(c) {
  return `
    <a href="#cursos" class="curso-card">
      <div class="curso-cover">
        <img src="img/cursos/${c.capa}.jpg" alt="" loading="lazy" width="640" height="256">
        ${c.selo ? `<span class="curso-selo">${c.selo}</span>` : ''}
      </div>
      <h3 class="curso-titulo">${c.titulo}</h3>
      <span class="curso-autor">${c.autor}</span>
      <div class="curso-nota">
        <strong>${c.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</strong>
        <span class="estrelas" aria-hidden="true">${estrelas(c.nota)}</span>
        <span>(${c.avaliacoes.toLocaleString('pt-BR')})</span>
      </div>
      <span class="curso-meta">${c.horas} h no total • ${c.aulas} aulas</span>
      ${formatarPreco(c.preco)}
      <span class="curso-nivel">${c.nivel}</span>
    </a>
  `;
}

function montarCursos() {
  // primeira seção: 4 primeiros cursos | segunda seção (após a chamada): os demais
  const grades = [
    ['cursos-grid', cursos.slice(0, 4)],
    ['cursos-grid-2', cursos.slice(4)]
  ];

  grades.forEach(([id, lista]) => {
    const grade = document.getElementById(id);
    if (grade) grade.innerHTML = lista.map(cardCurso).join('');
  });
}

/* ---------- 2) CABEÇALHO (login / cadastro) ----------
   Depende de js/auth.js (window.NivelDevAuth).
   Deslogado: mostra "Entrar" e "Inscreva-se" (links para login.html / cadastro.html).
   Logado:    mostra "Olá, <nome>" e o botão "Sair". */

function mostrarCabecalhoLogado(usuario) {
  const acoes = document.querySelector('.header-actions');
  if (!acoes) return;

  const saudacao = document.createElement('span');
  saudacao.className = 'header-user';
  saudacao.textContent = 'Olá, ' + (usuario.nome || '').split(' ')[0]; // textContent: sem risco de HTML injetado

  const sair = document.createElement('button');
  sair.type = 'button';
  sair.className = 'btn btn-outline';
  sair.id = 'btn-sair';
  sair.textContent = 'Sair';
  sair.addEventListener('click', () => {
    NivelDevAuth.logout();
    window.location.reload();
  });

  const painel = document.createElement('a');
  painel.href = 'home.html';
  painel.className = 'btn btn-solid';
  painel.textContent = 'Meu painel';

  acoes.replaceChildren(saudacao, painel, sair);

  // quem já está logado: "Começar agora" leva direto aos cursos, em vez do login
  const comecar = document.getElementById('banner-comecar');
  if (comecar) comecar.setAttribute('href', '#cursos');

  // quem já tem conta não precisa do convite de cadastro
  const convite = document.getElementById('cadastro');
  if (convite) convite.closest('.section').hidden = true;
}

async function iniciarCabecalho() {
  if (!window.NivelDevAuth || !NivelDevAuth.getToken()) return;

  // mostra na hora com o que está salvo...
  const salvo = NivelDevAuth.getUser();
  if (salvo) mostrarCabecalhoLogado(salvo);

  // ...e confirma com o servidor se o token ainda vale (pode ter expirado)
  try {
    const { user } = await NivelDevAuth.api.me();
    mostrarCabecalhoLogado(user);
  } catch (erro) {
    if (erro.status === 401) {
      NivelDevAuth.logout();
      window.location.reload();
    }
    // outros erros (servidor fora do ar etc.): mantém o que já está na tela
  }
}

/* ---------- 3) CARROSSEL DE TRILHAS ----------
   Troca sozinho a cada 5 s; pausa ao passar o mouse/focar e respeita
   "reduzir movimento". Setas, bolinhas, teclado e arraste no celular. */

function iniciarCarrosselTrilhas() {
  const raiz = document.getElementById('trilhas-carousel');
  if (!raiz) return;

  const trilho = raiz.querySelector('.trilhas-track');
  const slides = Array.from(raiz.querySelectorAll('.trilha-slide'));
  const dots = raiz.querySelector('.trilhas-dots');
  const total = slides.length;
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let atual = 0;
  let timer = null;

  const bolinhas = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'trilhas-dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ir para a trilha ' + (i + 1));
    b.addEventListener('click', () => { ir(i); reiniciar(); });
    dots.appendChild(b);
    return b;
  });

  function ir(i) {
    atual = (i + total) % total;
    trilho.style.transform = 'translateX(' + (-atual * 100) + '%)';
    slides.forEach((s, n) => { s.tabIndex = n === atual ? 0 : -1; s.setAttribute('aria-hidden', n === atual ? 'false' : 'true'); });
    bolinhas.forEach((b, n) => b.setAttribute('aria-selected', n === atual ? 'true' : 'false'));
  }

  function parar() { clearInterval(timer); timer = null; }
  function iniciar() { if (!reduzMovimento && !timer) timer = setInterval(() => ir(atual + 1), 5000); }
  function reiniciar() { parar(); iniciar(); }

  raiz.querySelector('.trilhas-prev').addEventListener('click', () => { ir(atual - 1); reiniciar(); });
  raiz.querySelector('.trilhas-next').addEventListener('click', () => { ir(atual + 1); reiniciar(); });

  raiz.addEventListener('mouseenter', parar);
  raiz.addEventListener('mouseleave', iniciar);
  raiz.addEventListener('focusin', parar);
  raiz.addEventListener('focusout', iniciar);
  raiz.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { ir(atual - 1); reiniciar(); }
    if (e.key === 'ArrowRight') { ir(atual + 1); reiniciar(); }
  });

  // arraste horizontal (celular)
  let x0 = null;
  raiz.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; parar(); }, { passive: true });
  raiz.addEventListener('touchend', (e) => {
    if (x0 !== null) {
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) ir(atual + (dx < 0 ? 1 : -1));
    }
    x0 = null;
    iniciar();
  });

  // pausa quando a aba está em segundo plano
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : iniciar()));

  ir(0);
  iniciar();
}

document.addEventListener('DOMContentLoaded', () => {
  montarCursos();
  iniciarCarrosselTrilhas();
  iniciarCabecalho();
});
