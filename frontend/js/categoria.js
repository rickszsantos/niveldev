/* ============================================================
   NívelDev — lista de exercícios (categoria.html)
   Lista de exercícios em rolagem (sem paginação), com busca
   (todos os exercícios são em Python).
   Menu, topo, usuário e proteção da página: js/layout.js.
   Abre como categoria.html?id=<categoria> (vindo da tela de
   Exercícios) ou só categoria.html para ver todos.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  /* ---------- DADOS ----------
     ATENÇÃO: ainda não existe API de exercícios no back-end,
     então estes exercícios são EXEMPLOS. Quando a rota existir,
     troque este array pelo retorno da API (mesmos campos).
     dificuldade: de 1 a 10 */
  const exercicios = [
    { id: 1,  titulo: 'Soma de Dois Números',      desc: 'Leia dois números e mostre a soma deles.',              dificuldade: 1,  categoria: 'iniciante',  linguagem: 'python' },
    { id: 2,  titulo: 'Par ou Ímpar',              desc: 'Informe se um número digitado é par ou ímpar.',         dificuldade: 1,  categoria: 'iniciante',  linguagem: 'python' },
    { id: 3,  titulo: 'Maior de Três Números',     desc: 'Descubra qual é o maior entre três números.',           dificuldade: 2,  categoria: 'iniciante',  linguagem: 'python' },
    { id: 4,  titulo: 'Média de Notas',            desc: 'Calcule a média de quatro notas e diga se foi aprovado.', dificuldade: 2, categoria: 'iniciante',  linguagem: 'python' },
    { id: 5,  titulo: 'Tabuada',                   desc: 'Mostre a tabuada de 1 a 10 de um número informado.',    dificuldade: 2,  categoria: 'iniciante',  linguagem: 'python' },
    { id: 6,  titulo: 'Conversor de Temperatura',  desc: 'Converta graus Celsius para Fahrenheit.',               dificuldade: 2,  categoria: 'python',     linguagem: 'python' },
    { id: 7,  titulo: 'Calculadora Simples',       desc: 'Faça as quatro operações com dois números.',            dificuldade: 3,  categoria: 'python',     linguagem: 'python' },
    { id: 8,  titulo: 'Contagem de Vogais',        desc: 'Conte quantas vogais existem em uma frase.',            dificuldade: 3,  categoria: 'strings',    linguagem: 'python' },
    { id: 9,  titulo: 'Inverter uma Palavra',      desc: 'Mostre uma palavra escrita de trás para frente.',       dificuldade: 3,  categoria: 'strings',    linguagem: 'python' },
    { id: 10, titulo: 'Contar Palavras',           desc: 'Conte quantas palavras existem em um texto.',           dificuldade: 3,  categoria: 'strings',    linguagem: 'python' },
    { id: 11, titulo: 'Maior Elemento da Lista',   desc: 'Encontre o maior número de uma lista sem usar max().',  dificuldade: 3,  categoria: 'estruturas', linguagem: 'python' },
    { id: 12, titulo: 'Fatorial',                  desc: 'Calcule o fatorial de um número informado.',            dificuldade: 4,  categoria: 'logica',     linguagem: 'python' },
    { id: 13, titulo: 'Palíndromo',                desc: 'Verifique se uma palavra é igual de trás para frente.', dificuldade: 4,  categoria: 'strings',    linguagem: 'python' },
    { id: 14, titulo: 'Remover Duplicados',        desc: 'Remova os itens repetidos de uma lista.',               dificuldade: 5,  categoria: 'estruturas', linguagem: 'python' },
    { id: 15, titulo: 'Ordenar Lista',             desc: 'Ordene uma lista de números sem usar sort().',          dificuldade: 6,  categoria: 'estruturas', linguagem: 'python' },
    { id: 16, titulo: 'Verificar Número Primo',    desc: 'Verifique se um número é primo.',                       dificuldade: 7,  categoria: 'logica',     linguagem: 'python' },
    { id: 17, titulo: 'Primos até N',              desc: 'Mostre todos os números primos até um limite.',         dificuldade: 8,  categoria: 'logica',     linguagem: 'python' },
    { id: 18, titulo: 'Sequência de Fibonacci',    desc: 'Mostre os N primeiros números da sequência.',           dificuldade: 9,  categoria: 'logica',     linguagem: 'python' },
  ];

  // nomes das categorias (os mesmos ids da tela de Exercícios)
  const NOMES_CATEGORIA = {
    iniciante: 'Iniciante',
    python: 'Python',
    strings: 'Strings',
    estruturas: 'Estruturas de Dados',
    logica: 'Lógica',
    outros: 'Outros',
  };

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
  const categoriaId = new URLSearchParams(window.location.search).get('id');
  const nomeCategoria = NOMES_CATEGORIA[categoriaId];

  if (nomeCategoria) {
    $('cat-titulo').textContent = nomeCategoria;
    document.title = nomeCategoria + ' — Exercícios — NívelDev';
  }

  const daCategoria = nomeCategoria
    ? exercicios.filter((e) => e.categoria === categoriaId)
    : exercicios;

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
            <h3>${e.titulo}</h3>
            <p>${e.desc}</p>
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
