/* ============================================================
   NívelDev — script inicial
   1) Lista de cursos (a grade da home é montada a partir dela)
   2) Botão Entrar (placeholder até a tela de login existir)
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

/* ---------- 2) BOTÕES ---------- */
document.addEventListener('DOMContentLoaded', () => {
  montarCursos();

  // TODO: trocar por navegação para as páginas de login e cadastro
  // (ou por um fetch() para a API do back-end, quando existir)
  const avisos = [
    // Inscreva-se e Criar minha conta grátis já abrem o cadastro.html
  ];

  avisos.forEach(([id, mensagem]) => {
    const botao = document.getElementById(id);
    if (!botao) return;
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      alert(mensagem);
    });
  });
});