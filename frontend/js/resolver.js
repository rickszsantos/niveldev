/* ============================================================
   NívelDev — tela de resolver exercício (resolver.html)
   Abre como resolver.html?id=<exercício> (vindo da lista).

   Esta tela NÃO corrige nada: quem corrige é o servidor.
     1) Busca o exercício em GET /exercises/:id (o aluno só recebe
        o caso de exemplo; os testes ocultos nunca chegam aqui)
     2) Editor de código (cores, números de linha, Tab, recuo)
     3) "Enviar" faz POST /submissions e mostra o veredito:
        Aceito, Resposta incorreta, Erro de execução, Tempo
        esgotado, Memória excedida ou Erro no corretor

   Todo texto vindo do servidor entra na página com textContent
   (nunca innerHTML), para que ninguém consiga injetar HTML.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(async function () {

  const $ = (id) => document.getElementById(id);

  /* ============================================================
     LINGUAGENS (seletor do editor)
     ============================================================ */

  // palavras para colorir o código de cada linguagem
  const PY = {
    tokens: /(#[^\n]*)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_\u00C0-\u00FF][\w\u00C0-\u00FF]*)/g,
    palavras: new Set(['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
      'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
      'return', 'try', 'while', 'with', 'yield', 'None', 'True', 'False']),
    nativas: new Set(['print', 'input', 'int', 'float', 'str', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'bool',
      'sum', 'min', 'max', 'abs', 'round', 'sorted', 'enumerate', 'zip', 'map', 'type', 'reversed', 'any', 'all']),
    declara: ['def', 'class'],
  };

  const LINGUAGENS = {
    python: {
      nome: 'Python 3',
      sintaxe: PY,
      abreBloco: /:\s*$/,
      inicial: (ex) => ex.inicial,
    },
  };

  const CHAVE_LINGUAGEM = 'niveldev_linguagem';

  /* ============================================================
     EXERCÍCIO (vem da API)
     ============================================================ */
  const idUrl = new URLSearchParams(window.location.search).get('id');
  let exercicio = null;
  try {
    const { exercise } = await NivelDevAuth.api.obterExercicio(idUrl);
    exercicio = {
      id: exercise.id,
      titulo: exercise.titulo,
      dificuldade: exercise.dificuldade,
      enunciado: String(exercise.enunciado || '').split(/\n{2,}/), // um parágrafo a cada linha em branco
      exemplo: (exercise.casos_de_teste || [])[0] || null,          // o aluno só recebe casos NÃO ocultos
      inicial: '# Escreva sua solução aqui\n',
    };
  } catch (erro) {
    if (erro.status === 401) {
      NivelDevAuth.logout();
      window.location.replace('login.html');
      return;
    }
    // 400, 404 ou sem conexão: cai na tela "Exercício não encontrado"
  }

  if (!exercicio) {
    $('rs-grid').hidden = true;
    $('rs-vazio').hidden = false;
    document.title = 'Exercício não encontrado — NívelDev';
    return;
  }

  function lerLS(chave) { try { return localStorage.getItem(chave); } catch (e) { return null; } }
  function salvarLS(chave, valor) { try { localStorage.setItem(chave, valor); } catch (e) { /* sem storage: tudo bem */ } }

  // O selo "Resolvido" vem do servidor: existe alguma submissão ACEITO deste aluno neste exercício?
  const marcarResolvido = () => { $('rs-resolvido').hidden = false; };
  NivelDevAuth.api.listarSubmissoes('?exercicioId=' + exercicio.id + '&limite=100')
    .then(({ submissoes }) => { if (submissoes.some((s) => s.status === 'ACEITO')) marcarResolvido(); })
    .catch(() => { /* sem histórico: simplesmente não mostra o selo */ });

  /* ---------- Enunciado ---------- */
  // 1–3 fácil, 4–6 médio, 7–10 difícil (igual à lista de exercícios)
  const nivel = exercicio.dificuldade <= 3 ? { c: 'facil', t: 'Fácil' }
    : exercicio.dificuldade <= 6 ? { c: 'medio', t: 'Médio' } : { c: 'dificil', t: 'Difícil' };

  document.title = exercicio.titulo + ' — Exercícios — NívelDev';
  $('rs-titulo').textContent = exercicio.titulo;
  // a dificuldade (1 a 10) aparece como número na frente do nome; a cor segue o nível
  $('rs-nivel').textContent = exercicio.dificuldade;
  $('rs-nivel').classList.add('nivel-' + nivel.c);
  $('rs-nivel').title = 'Dificuldade ' + exercicio.dificuldade + ' de 10 (' + nivel.t + ')';
  $('rs-nivel').setAttribute('aria-label', 'Dificuldade ' + exercicio.dificuldade + ' de 10, ' + nivel.t);
  $('rs-voltar').href = 'categoria.html';

  $('rs-enunciado').textContent = '';
  exercicio.enunciado.forEach((par) => {
    const p = document.createElement('p');
    p.textContent = par;
    $('rs-enunciado').appendChild(p);
  });

  // exemplo de entrada e saída (se o exercício não tiver caso visível, os quadros somem)
  const exemplo = exercicio.exemplo;
  $('rs-ex-entrada').textContent = exemplo ? exemplo.entrada : '';
  $('rs-ex-saida').textContent = exemplo ? exemplo.saida_esperada : '';
  document.querySelectorAll('.rs-bloco').forEach((el) => { el.style.display = exemplo ? '' : 'none'; });

  $('rs-proximo').textContent = 'Ver todos os exercícios';
  $('rs-proximo').href = 'categoria.html';

  /* ============================================================
     EDITOR
     ============================================================ */
  const ta = $('rs-texto');
  const realce = $('rs-realce');
  const gutter = $('rs-gutter');
  const caixaCodigo = $('rs-codigo');
  const selLinguagem = $('rs-linguagem');
  let linhaErro = 0;

  // linguagem atual (a última escolhida fica salva neste navegador)
  let lingua = lerLS(CHAVE_LINGUAGEM);
  if (!LINGUAGENS[lingua]) lingua = 'python';
  const L = () => LINGUAGENS[lingua];

  selLinguagem.innerHTML = Object.keys(LINGUAGENS).map((k) => '<option value="' + k + '">' + LINGUAGENS[k].nome + '</option>').join('');
  selLinguagem.value = lingua;

  // o rascunho de cada linguagem fica separado (Python mantém a chave antiga)
  const chaveCodigo = () => 'niveldev_codigo_' + exercicio.id + (lingua === 'python' ? '' : '_' + lingua);
  const codigoInicial = () => L().inicial(exercicio);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Colorir o código: comentários, textos, números, palavras da linguagem e funções nativas
  function colorir(src) {
    const sx = L().sintaxe;
    let saida = '';
    let ultimo = 0;
    let anterior = '';
    let m;
    sx.tokens.lastIndex = 0;
    while ((m = sx.tokens.exec(src))) {
      saida += esc(src.slice(ultimo, m.index));
      const txt = m[0];
      let cls = '';
      if (m[1]) cls = 'c';
      else if (m[2]) cls = 's';
      else if (m[3]) cls = 'n';
      else if (sx.palavras.has(txt)) cls = 'k';
      else if (sx.declara.indexOf(anterior) !== -1) cls = 'f';
      else if (sx.nativas.has(txt) && (txt === 'console' || src[sx.tokens.lastIndex] === '(')) cls = 'b';
      saida += cls ? '<span class="t-' + cls + '">' + esc(txt) + '</span>' : esc(txt);
      anterior = m[4] ? txt : '';
      ultimo = sx.tokens.lastIndex;
    }
    return saida + esc(src.slice(ultimo));
  }

  function desenharEditor() {
    const texto = ta.value;
    const linhas = texto.split('\n');
    realce.innerHTML = colorir(texto) + '\n';   // a linha extra deixa o último Enter visível
    gutter.innerHTML = linhas.map((_, i) =>
      '<span' + (i + 1 === linhaErro ? ' class="is-erro"' : '') + '>' + (i + 1) + '</span>').join('');
    const maior = linhas.reduce((m, l) => Math.max(m, l.length), 0);
    caixaCodigo.style.setProperty('--cols', Math.max(maior + 2, 24));
  }

  function limparErroDaLinha() {
    if (!linhaErro) return;
    linhaErro = 0;
    desenharEditor();
  }

  // insere texto no cursor mantendo o "desfazer" (Ctrl+Z) funcionando
  function inserir(texto) {
    if (document.execCommand && document.execCommand('insertText', false, texto)) return;
    const ini = ta.selectionStart;
    ta.setRangeText(texto, ini, ta.selectionEnd, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // recua ou avança todas as linhas da seleção (Tab / Shift+Tab com várias linhas)
  function recuarLinhas(tirar) {
    const v = ta.value;
    const selIni = ta.selectionStart;
    const selFim = ta.selectionEnd;
    const ini = v.lastIndexOf('\n', selIni - 1) + 1;
    let fim = v.indexOf('\n', selFim);
    if (fim === -1) fim = v.length;

    const bloco = v.slice(ini, fim).split('\n');
    const novo = bloco.map((l) => (tirar ? l.replace(/^( {1,4}|\t)/, '') : '    ' + l));
    const texto = novo.join('\n');
    const primeiraMudanca = novo[0].length - bloco[0].length;

    ta.setRangeText(texto, ini, fim, 'preserve');
    ta.selectionStart = Math.max(ini, selIni + primeiraMudanca);
    ta.selectionEnd = Math.max(ta.selectionStart, selFim + (texto.length - (fim - ini)));
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  let soltarTab = false; // Esc libera o próximo Tab para sair do editor (acessibilidade)

  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      enviar();
      return;
    }

    if (e.key === 'Escape') { soltarTab = true; return; }

    if (e.key === 'Tab') {
      if (soltarTab) { soltarTab = false; return; }
      e.preventDefault();
      const varias = ta.value.slice(ta.selectionStart, ta.selectionEnd).indexOf('\n') !== -1;
      if (e.shiftKey || varias) recuarLinhas(e.shiftKey);
      else inserir('    ');
      return;
    }
    soltarTab = false;

    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // mantém o recuo da linha de cima; ao abrir um bloco (":" no Python, "{" no JavaScript) recua mais um nível
      const antes = ta.value.slice(0, ta.selectionStart);
      const linha = antes.slice(antes.lastIndexOf('\n') + 1);
      const recuo = (linha.match(/^[ \t]*/) || [''])[0];
      const extra = L().abreBloco.test(linha) ? '    ' : '';
      e.preventDefault();
      inserir('\n' + recuo + extra);
    }
  });

  let temporizador = null;
  ta.addEventListener('input', () => {
    limparErroDaLinha();
    desenharEditor();
    clearTimeout(temporizador);
    temporizador = setTimeout(() => salvarLS(chaveCodigo(), ta.value), 400); // rascunho
  });

  // o foco sempre cai no campo, mesmo clicando no espaço vazio do editor
  $('rs-editor').addEventListener('mousedown', (e) => {
    if (e.target === $('rs-editor') || e.target === gutter) { e.preventDefault(); ta.focus(); }
  });

  function carregarCodigo() {
    ta.value = lerLS(chaveCodigo()) || codigoInicial();
    ta.setAttribute('aria-label', 'Editor de código ' + L().nome);
    linhaErro = 0;
    desenharEditor();
  }
  carregarCodigo();


  /* ============================================================
     SAÍDA DO PROGRAMA
     Mostra só a saída (ou o erro) e o veredito que o servidor devolveu.
     ============================================================ */
  const saida = $('rs-saida');
  const saidaTexto = $('rs-out-texto');
  const saidaErro = $('rs-out-erro');
  const status = $('rs-status');
  const statusTxt = $('rs-status-txt');
  const btnEnviar = $('rs-enviar');
  const linkProximo = $('rs-proximo');

  function definirStatus(estado, texto) {
    status.dataset.estado = estado;
    statusTxt.textContent = texto;
  }

  function mostrarSaida(texto, erro, acerto) {
    saidaTexto.textContent = texto;
    saidaErro.textContent = erro || '';
    saida.classList.toggle('is-vazio', !texto && !erro);
    saida.classList.toggle('is-acerto', !!acerto);
  }

  function travar(sim) {
    btnEnviar.disabled = sim;
    selLinguagem.disabled = sim;
  }

  let ocupado = false;

  function aguardandoEnvio() {
    definirStatus('espera', 'Aguardando envio');
    mostrarSaida('', '', false);
    linkProximo.hidden = true;
  }

  // ao trocar a linguagem: salva o rascunho atual e abre o da outra
  selLinguagem.addEventListener('change', () => {
    clearTimeout(temporizador);
    salvarLS(chaveCodigo(), ta.value);
    lingua = selLinguagem.value;
    salvarLS(CHAVE_LINGUAGEM, lingua);
    carregarCodigo();
    aguardandoEnvio();
    ta.focus();
  });

  /* ============================================================
     ENVIAR: o servidor corrige; aqui só mostramos o resultado
     ============================================================ */

  // status do servidor -> o que a tela mostra (estado = cor do indicador)
  const STATUS_TELA = {
    ACEITO:             { estado: 'ok',    texto: 'Aceito' },
    RESPOSTA_INCORRETA: { estado: 'erro',  texto: 'Resposta incorreta' },
    TEMPO_EXCEDIDO:     { estado: 'tempo', texto: 'Tempo esgotado' },
    ERRO_DE_EXECUCAO:   { estado: 'erro',  texto: 'Erro de execução' },
    MEMORIA_EXCEDIDA:   { estado: 'erro',  texto: 'Memória excedida' },
    ERRO_INTERNO:       { estado: 'erro',  texto: 'Erro no corretor' },
  };

  function mostrarResultado(r) {
    const info = STATUS_TELA[r.status] || STATUS_TELA.ERRO_INTERNO;
    definirStatus(info.estado, info.texto);

    let texto = r.mensagem || '';
    if (r.exemplo) { // só vem quando o teste que falhou é o de exemplo
      texto += '\n\nEntrada:\n' + r.exemplo.entrada +
               '\n\nEsperado:\n' + r.exemplo.esperado +
               '\n\nObtido:\n' + r.exemplo.obtido;
    }

    if (r.status === 'ACEITO') {
      mostrarSaida(texto + '\nTestes: ' + r.testes_passados + ' de ' + r.total_testes, '', true);
      linkProximo.hidden = false;
      marcarResolvido();
      NivelDevUI.toast('Exercício resolvido!', 'sucesso');
      return;
    }

    mostrarSaida('', texto, false);
    // erro de execução: o Python diz "line 3"; destacamos essa linha no editor
    const linha = /line (\d+)/.exec(r.mensagem || '');
    if (r.status === 'ERRO_DE_EXECUCAO' && linha) { linhaErro = Number(linha[1]); desenharEditor(); }
  }

  function tratarErroDeEnvio(erro) {
    if (erro.status === 401) { // sessão expirada
      NivelDevAuth.logout();
      window.location.replace('login.html');
      return;
    }
    definirStatus('erro', erro.status === 429 ? 'Aguarde' : 'Não enviado');
    mostrarSaida('', erro.message, false); // 400, 404, 413, 429 e falta de conexão já trazem texto pronto
  }

  async function enviar() {
    if (ocupado) return;
    ocupado = true;
    travar(true);
    linkProximo.hidden = true;
    limparErroDaLinha();
    mostrarSaida('', '', false);
    definirStatus('executando', 'Corrigindo…');
    try {
      const resultado = await NivelDevAuth.api.enviarSubmissao({
        exercicioId: exercicio.id,
        linguagem: lingua,
        codigo: ta.value,
      });
      mostrarResultado(resultado);
    } catch (erro) {
      tratarErroDeEnvio(erro);
    } finally {
      ocupado = false;
      travar(false);
    }
  }

  btnEnviar.addEventListener('click', enviar);
  aguardandoEnvio();
})();
