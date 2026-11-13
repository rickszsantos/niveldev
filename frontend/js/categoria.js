/* ============================================================
   NívelDev — lista de exercícios (categoria.html)
   Lista de exercícios em rolagem (sem paginação), com busca
   (todos os exercícios são em Python).
   Menu, topo, usuário e proteção da página: js/layout.js.
   Abre como categoria.html?id=<categoria> (vindo da tela de
   Exercícios) ou só categoria.html para ver todos.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(async function () {
  /* ---------- DADOS (vêm da API: GET /exercises) ----------
     A API ainda não tem categoria nem resumo; por isso a lista é única
     e sem descrição. Quando existirem, basta preencher aqui. */
  let exercicios = [];
  try {
    const { exercises } = await NivelDevAuth.api.listarExercicios('?limite=100');
    exercicios = exercises.map((e) => ({
      id: e.id, titulo: e.titulo, desc: '', dificuldade: e.dificuldade, categoria: '', linguagem: 'python',
    }));
  } catch (erro) {
    if (erro.status === 401) {
      NivelDevAuth.logout();
      window.location.replace('login.html');
      return;
    }
    NivelDevUI.toast(erro.message, 'erro');
  }

  // escapa o texto antes de montar HTML (os títulos vêm do banco, escritos por professores)
  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------- ELEMENTOS ---------- */
  const $ = (id) => document.getElementById(id);
  const lista = $('cat-lista');
  const vazio = $('cat-vazio');
  const vazioTitulo = $('cat-vazio-titulo');
  const vazioTexto = $('cat-vazio-texto');
  const contador = $('cat-contador');
  const busca = $('cat-busca');

  /* ---------- CATEGORIA DA URL ---------- */
  // Sem categoria na API por enquanto: mostramos todos os exercícios.
  const daCategoria = exercicios;

  /* ---------- RENDERIZAÇÃO ---------- */

  // 4 barrinhas: cada uma vale 2,5 pontos; a última pode ficar parcialmente cheia
  function barras(dificuldade) {
    const cheias = (dificuldade / 10) * 4;
    let html = '';
    for (let i = 0; i < 4; i++) {
      const pct = Math.max(0, Math.min(1, cheias - i)) * 100;
      html += `<span class="cat-barra"><span style="width:${pct}%"></span></span>`;
    }
    return html;
  }

  // 1–3 fácil, 4–6 médio, 7–10 difícil (define a cor das barrinhas e da etiqueta)
  function nivel(dificuldade) {
    if (dificuldade <= 3) return { classe: 'facil', texto: 'Fácil' };
    if (dificuldade <= 6) return { classe: 'medio', texto: 'Médio' };
    return { classe: 'dificil', texto: 'Difícil' };
  }

  function render(itens) {
    lista.innerHTML = itens.map((e, i) => {
      const n = nivel(e.dificuldade);
      return `
      <li style="--i:${Math.min(i, 12)}">
        <article class="cat-linha">
          <div>
            <h3>${esc(e.titulo)}</h3>
            ${e.desc ? `<p>${esc(e.desc)}</p>` : ''}
          </div>
          <div class="cat-dif cat-dif--${n.classe}" aria-label="Dificuldade ${n.texto}, ${e.dificuldade} de 10">
            <span class="cat-barras" aria-hidden="true">${barras(e.dificuldade)}</span>
            <span class="app-tag tag-${n.classe}" aria-hidden="true">${n.texto}</span>
          </div>
          <a class="cat-resolver" href="resolver.html?id=${e.id}">Resolver ${SETA}</a>
        </article>
      </li>`;
    }).join('');

    vazio.hidden = itens.length > 0;
    if (daCategoria.length) {
      vazioTitulo.textContent = 'Nenhum exercício encontrado';
      vazioTexto.textContent = 'Tente buscar por outro termo, como “soma” ou “lista”.';
    } else {
      vazioTitulo.textContent = 'Ainda não há exercícios aqui';
      vazioTexto.textContent = 'Novos desafios desta categoria chegam em breve.';
    }

    contador.hidden = itens.length === 0;
    contador.textContent = itens.length === 1
      ? 'Mostrando 1 exercício'
      : `Mostrando ${itens.length} exercícios`;
  }

  /* ---------- FILTROS ---------- */

  // remove acentos para a busca funcionar com "numero" ou "número"
  const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function filtrar() {
    const termo = normalizar(busca.value.trim());

    render(daCategoria.filter((e) =>
      normalizar(e.titulo).includes(termo) || normalizar(e.desc).includes(termo)
    ));
  }

  busca.addEventListener('input', filtrar);

  render(daCategoria);
})();
