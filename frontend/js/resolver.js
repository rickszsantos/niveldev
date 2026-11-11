/* ============================================================
   NívelDev — tela de execução de exercício (resolver.html)
   Abre como resolver.html?id=<exercicio> (vindo da lista de
   exercícios). Tem 3 partes:
     1) Editor de código Python (com cores, números de linha,
        Tab e recuo automático)
     2) Motor: roda o Python NO NAVEGADOR com Pyodide, dentro de
        um Web Worker (se o código travar, só o worker é parado)
     3) "Executar" roda com a entrada digitada; "Enviar solução"
        roda contra todos os testes do exercício

   O 1º acesso baixa o Python (~10 MB, depois fica no cache do
   navegador), então precisa de internet. Nada é enviado a servidor.
   Dados dos exercícios: js/resolver-dados.js.
   Depende de js/auth.js, js/ui.js e js/layout.js.
   ============================================================ */

(function () {
  const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
  const LIMITE_MS = 8000; // tempo máximo de cada execução

  const $ = (id) => document.getElementById(id);

  /* ============================================================
     MOTOR (Python no navegador)
     ============================================================ */

  // Código que roda DENTRO do worker. É escrito como função só para ficar legível;
  // vira texto e é carregado por um Blob (não depende de nenhum outro arquivo).
  function codigoDoWorker(urlPyodide) {
    let py = null;

    // roda o código do aluno com a "entrada" simulada e captura tudo que ele imprime
    const HARNESS = [
      'import sys, io, json',
      'def __niveldev_exec(codigo, entrada):',
      '    saida = io.StringIO()',
      '    velhos = (sys.stdin, sys.stdout, sys.stderr)',
      '    sys.stdin = io.StringIO(entrada)',
      '    sys.stdout = saida',
      '    sys.stderr = saida',
      '    erro = None',
      '    linha = None',
      '    try:',
      '        exec(compile(codigo, "<codigo>", "exec"), {"__name__": "__main__"})',
      '    except SystemExit:',
      '        pass',
      '    except BaseException as e:',
      '        if isinstance(e, SyntaxError):',
      '            linha = e.lineno',
      '            erro = "SyntaxError: " + str(e.msg)',
      '        elif isinstance(e, EOFError):',
      '            erro = "EOFError: o programa pediu mais entradas do que as informadas"',
      '            tb = e.__traceback__',
      '            while tb is not None:',
      '                if tb.tb_frame.f_code.co_filename == "<codigo>":',
      '                    linha = tb.tb_lineno',
      '                tb = tb.tb_next',
      '        else:',
      '            erro = type(e).__name__ + ": " + str(e)',
      '            tb = e.__traceback__',
      '            while tb is not None:',
      '                if tb.tb_frame.f_code.co_filename == "<codigo>":',
      '                    linha = tb.tb_lineno',
      '                tb = tb.tb_next',
      '    finally:',
      '        sys.stdin, sys.stdout, sys.stderr = velhos',
      '    return json.dumps({"saida": saida.getvalue(), "erro": erro, "linha": linha})',
    ].join('\n');

    (async () => {
      try {
        importScripts(urlPyodide);
        py = await loadPyodide({ indexURL: urlPyodide.replace(/pyodide\.js$/, '') });
        py.runPython(HARNESS);
        postMessage({ tipo: 'pronto' });
      } catch (e) {
        postMessage({ tipo: 'falha', mensagem: String(e && e.message || e) });
      }
    })();

    onmessage = (ev) => {
      const d = ev.data;
      if (d.tipo !== 'rodar' || !py) return;
      try {
        const json = py.globals.get('__niveldev_exec')(d.codigo, d.entrada);
        postMessage(Object.assign({ tipo: 'resultado', id: d.id }, JSON.parse(json)));
      } catch (e) {
        postMessage({ tipo: 'resultado', id: d.id, saida: '', erro: String(e && e.message || e), linha: null });
      }
    };
  }

  const motor = (function () {
    let worker = null;
    let prontoPromise = null;
    let estaPronto = false;
    let seq = 0;
    const pendentes = new Map();

    function iniciar() {
      if (worker) worker.terminate();
      estaPronto = false;
      pendentes.clear();

      const fonte = '(' + codigoDoWorker.toString() + ')(' + JSON.stringify(PYODIDE_URL) + ');';
      const url = URL.createObjectURL(new Blob([fonte], { type: 'text/javascript' }));
      worker = new Worker(url);

      prontoPromise = new Promise((resolve, reject) => {
        worker.onmessage = (ev) => {
          const d = ev.data;
          if (d.tipo === 'pronto') { estaPronto = true; resolve(); }
          else if (d.tipo === 'falha') reject(new Error(d.mensagem));
          else if (d.tipo === 'resultado') {
            const p = pendentes.get(d.id);
            if (p) { pendentes.delete(d.id); p(d); }
          }
        };
        worker.onerror = () => reject(new Error('worker'));
      });
      prontoPromise.catch(() => {}); // o erro é tratado por quem chama aguardar()
    }

    // roda um código; devolve { saida, erro, linha } ou { tempo: true } se passou do limite
    async function rodar(codigo, entrada) {
      await prontoPromise;
      return new Promise((resolve) => {
        const id = ++seq;
        const timer = setTimeout(() => {
          pendentes.delete(id);
          iniciar();               // mata o worker travado e já prepara outro
          resolve({ tempo: true });
        }, LIMITE_MS);
        pendentes.set(id, (resultado) => { clearTimeout(timer); resolve(resultado); });
        worker.postMessage({ tipo: 'rodar', id, codigo, entrada });
      });
    }

    return { iniciar, rodar, aguardar: () => prontoPromise, pronto: () => estaPronto };
  })();

  /* ============================================================
     EXERCÍCIO DA URL
     ============================================================ */
  const exercicios = window.NivelDevExercicios || [];
  const idUrl = Number(new URLSearchParams(window.location.search).get('id'));
  const exercicio = exercicios.find((e) => e.id === idUrl);

  if (!exercicio) {
    $('rs-grid').hidden = true;
    $('rs-vazio').hidden = false;
    document.title = 'Exercício não encontrado — NívelDev';
    return;
  }

  const CHAVE_CODIGO = 'niveldev_codigo_' + exercicio.id;
  const CHAVE_RESOLVIDOS = 'niveldev_resolvidos';

  function lerLS(chave) { try { return localStorage.getItem(chave); } catch (e) { return null; } }
  function salvarLS(chave, valor) { try { localStorage.setItem(chave, valor); } catch (e) { /* sem storage: tudo bem */ } }

  function jaResolvido() {
    try { return JSON.parse(lerLS(CHAVE_RESOLVIDOS) || '[]').indexOf(exercicio.id) !== -1; } catch (e) { return false; }
  }

  // TODO: quando existir a API de submissões, envie o resultado para o servidor aqui
  function marcarResolvido() {
    let lista = [];
    try { lista = JSON.parse(lerLS(CHAVE_RESOLVIDOS) || '[]'); } catch (e) { /* recomeça */ }
    if (lista.indexOf(exercicio.id) === -1) lista.push(exercicio.id);
    salvarLS(CHAVE_RESOLVIDOS, JSON.stringify(lista));
    $('rs-resolvido').hidden = false;
  }

  /* ---------- Enunciado ---------- */
  // 1–3 fácil, 4–6 médio, 7–10 difícil (igual à lista de exercícios)
  const nivel = exercicio.dificuldade <= 3 ? { c: 'facil', t: 'Fácil' }
    : exercicio.dificuldade <= 6 ? { c: 'medio', t: 'Médio' } : { c: 'dificil', t: 'Difícil' };

  document.title = exercicio.titulo + ' — Exercícios — NívelDev';
  $('rs-titulo').textContent = exercicio.titulo;
  $('rs-nivel').textContent = nivel.t;
  $('rs-nivel').classList.add('tag-' + nivel.c);
  $('rs-nivel').setAttribute('aria-label', 'Dificuldade ' + nivel.t + ', ' + exercicio.dificuldade + ' de 10');
  $('rs-resolvido').hidden = !jaResolvido();
  $('rs-voltar').href = 'categoria.html?id=' + encodeURIComponent(exercicio.categoria);

  $('rs-enunciado').innerHTML = '';
  exercicio.enunciado.forEach((par) => {
    const p = document.createElement('p');
    p.textContent = par;
    $('rs-enunciado').appendChild(p);
  });

  const exemplo = exercicio.testes[0];
  $('rs-ex-entrada').textContent = exemplo.entrada;
  $('rs-ex-saida').textContent = exemplo.saida;
  $('rs-dica').textContent = exercicio.dica;

  /* ============================================================
     EDITOR
     ============================================================ */
  const ta = $('rs-texto');
  const realce = $('rs-realce');
  const gutter = $('rs-gutter');
  const caixaCodigo = $('rs-codigo');
  let linhaErro = 0;

  const PALAVRAS = new Set(['and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
    'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
    'return', 'try', 'while', 'with', 'yield', 'None', 'True', 'False']);
  const NATIVAS = new Set(['print', 'input', 'int', 'float', 'str', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'bool',
    'sum', 'min', 'max', 'abs', 'round', 'sorted', 'enumerate', 'zip', 'map', 'type', 'reversed', 'any', 'all']);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Colorir o código: comentários, textos, números, palavras da linguagem e funções nativas
  const TOKENS = /(#[^\n]*)|("""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_\u00C0-\u00FF][\w\u00C0-\u00FF]*)/g;

  function colorir(src) {
    let saida = '';
    let ultimo = 0;
    let anterior = '';
    let m;
    TOKENS.lastIndex = 0;
    while ((m = TOKENS.exec(src))) {
      saida += esc(src.slice(ultimo, m.index));
      const txt = m[0];
      let cls = '';
      if (m[1]) cls = 'c';
      else if (m[2]) cls = 's';
      else if (m[3]) cls = 'n';
      else if (PALAVRAS.has(txt)) cls = 'k';
      else if (anterior === 'def' || anterior === 'class') cls = 'f';
      else if (NATIVAS.has(txt) && src[TOKENS.lastIndex] === '(') cls = 'b';
      saida += cls ? '<span class="t-' + cls + '">' + esc(txt) + '</span>' : esc(txt);
      anterior = m[4] ? txt : '';
      ultimo = TOKENS.lastIndex;
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
      executar();
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
      // mantém o recuo da linha de cima; depois de ":" recua mais um nível
      const antes = ta.value.slice(0, ta.selectionStart);
      const linha = antes.slice(antes.lastIndexOf('\n') + 1);
      const recuo = (linha.match(/^[ \t]*/) || [''])[0];
      const extra = /:\s*$/.test(linha) ? '    ' : '';
      e.preventDefault();
      inserir('\n' + recuo + extra);
    }
  });

  let temporizador = null;
  ta.addEventListener('input', () => {
    limparErroDaLinha();
    desenharEditor();
    clearTimeout(temporizador);
    temporizador = setTimeout(() => salvarLS(CHAVE_CODIGO, ta.value), 400); // rascunho
  });

  // o foco sempre cai no campo, mesmo clicando no espaço vazio do editor
  $('rs-editor').addEventListener('mousedown', (e) => {
    if (e.target === $('rs-editor') || e.target === gutter) { e.preventDefault(); ta.focus(); }
  });

  ta.value = lerLS(CHAVE_CODIGO) || exercicio.inicial;
  desenharEditor();

  $('rs-reiniciar').addEventListener('click', () => {
    ta.focus();
    ta.select();
    inserir(exercicio.inicial);
    NivelDevUI.toast('Código inicial restaurado. Ctrl + Z desfaz.', 'info');
  });

  /* ============================================================
     SAÍDA E ENTRADA
     ============================================================ */
  const entrada = $('rs-entrada');
  const saida = $('rs-saida');
  const saidaTexto = $('rs-out-texto');
  const saidaErro = $('rs-out-erro');
  const status = $('rs-status');
  const statusTxt = $('rs-status-txt');
  const btnExecutar = $('rs-executar');
  const btnEnviar = $('rs-enviar');

  entrada.value = exemplo.entrada;

  function definirStatus(estado, texto) {
    status.dataset.estado = estado;
    statusTxt.textContent = texto;
  }

  function mostrarSaida(texto, erro) {
    saidaTexto.textContent = texto;
    saidaErro.textContent = erro || '';
    saida.classList.toggle('is-vazio', !texto && !erro);
  }

  function travar(sim) {
    btnExecutar.disabled = sim;
    btnEnviar.disabled = sim;
  }

  let ocupado = false;

  const mensagemErro = (r) =>
    (r.linha ? 'Erro na linha ' + r.linha + ':\n' : 'Erro:\n') + r.erro;

  const mensagemTempo = 'O programa passou de ' + (LIMITE_MS / 1000) + ' segundos sem terminar. Verifique se há um laço que nunca acaba.';

  // espera o Python ficar pronto; false se não conseguiu baixar
  async function garantirMotor() {
    if (motor.pronto()) return true;
    definirStatus('carregando', 'Preparando o Python…');
    try {
      await motor.aguardar();
      return true;
    } catch (e) {
      definirStatus('erro', 'Python indisponível');
      mostrarSaida('', 'Não foi possível carregar o Python. Verifique sua conexão com a internet e tente de novo.');
      motor.iniciar(); // a próxima tentativa começa do zero
      return false;
    }
  }

  async function executar() {
    if (ocupado) return;
    ocupado = true;
    travar(true);
    esconderTestes();
    limparErroDaLinha();
    mostrarSaida('', '');

    try {
      if (!(await garantirMotor())) return;
      definirStatus('executando', 'Executando…');
      const r = await motor.rodar(ta.value, entrada.value);

      if (r.tempo) {
        definirStatus('tempo', 'Tempo esgotado');
        mostrarSaida('', mensagemTempo);
      } else if (r.erro) {
        definirStatus('erro', 'Erro na execução');
        mostrarSaida(r.saida, (r.saida && !/\n$/.test(r.saida) ? '\n' : '') + mensagemErro(r));
        if (r.linha) { linhaErro = r.linha; desenharEditor(); }
      } else {
        definirStatus('ok', 'Execução concluída');
        mostrarSaida(r.saida, '');
      }
    } finally {
      ocupado = false;
      travar(false);
    }
  }

  /* ============================================================
     ENVIAR SOLUÇÃO (roda todos os testes)
     ============================================================ */
  const blocoTestes = $('rs-testes');
  const resumo = $('rs-testes-resumo');
  const listaTestes = $('rs-testes-lista');

  const normalizar = (s) => s.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

  function esconderTestes() { blocoTestes.hidden = true; }

  function el(tag, classe, texto) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }

  const ICONE_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICONE_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICONE_PAUSA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>';

  function linhaDetalhe(rotulo, valor) {
    const d = el('div', 'rs-detalhe');
    d.appendChild(el('span', '', rotulo));
    d.appendChild(el('pre', '', valor === '' ? '(vazio)' : valor));
    return d;
  }

  function mostrarTestes(resultados) {
    const passou = resultados.filter((r) => r.estado === 'ok').length;
    const total = resultados.length;
    const tudo = passou === total;

    resumo.innerHTML = '';
    resumo.className = 'rs-testes-resumo ' + (tudo ? 'is-ok' : 'is-falhou');
    const textos = el('div');
    textos.appendChild(el('strong', '', tudo ? 'Todos os testes passaram' : passou + ' de ' + total + ' testes passaram'));
    textos.appendChild(el('span', '', tudo ? 'Exercício resolvido. Bom trabalho!' : 'Veja abaixo o que saiu diferente do esperado.'));
    resumo.appendChild(textos);

    if (tudo) {
      const proximo = exercicios.find((e) => e.id === exercicio.id + 1);
      const link = el('a', 'rs-proximo', proximo ? 'Próximo exercício' : 'Ver todos os exercícios');
      link.href = proximo ? 'resolver.html?id=' + proximo.id : 'categoria.html';
      resumo.appendChild(link);
    }

    listaTestes.innerHTML = '';
    resultados.forEach((r, i) => {
      const li = el('li', 'rs-teste is-' + r.estado);
      const topo = el('div', 'rs-teste-topo');
      const icone = el('span', 'rs-teste-icone');
      icone.innerHTML = r.estado === 'ok' ? ICONE_OK : r.estado === 'pulado' ? ICONE_PAUSA : ICONE_X;
      topo.appendChild(icone);
      topo.appendChild(el('strong', '', 'Teste ' + (i + 1)));
      topo.appendChild(el('span', 'rs-teste-estado',
        r.estado === 'ok' ? 'Passou' : r.estado === 'pulado' ? 'Não executado' : r.estado === 'tempo' ? 'Tempo esgotado' : 'Falhou'));
      li.appendChild(topo);

      if (r.estado === 'falhou' || r.estado === 'tempo') {
        const det = el('div', 'rs-detalhes');
        det.appendChild(linhaDetalhe('Entrada', r.teste.entrada));
        det.appendChild(linhaDetalhe('Esperado', r.teste.saida));
        if (r.estado === 'tempo') det.appendChild(linhaDetalhe('Obtido', mensagemTempo));
        else if (r.erro) det.appendChild(linhaDetalhe('Obtido', (r.saida || '') + (r.saida ? '\n' : '') + mensagemErro(r)));
        else det.appendChild(linhaDetalhe('Obtido', r.saida));
        li.appendChild(det);
      }
      listaTestes.appendChild(li);
    });

    blocoTestes.hidden = false;
    blocoTestes.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function enviar() {
    if (ocupado) return;
    ocupado = true;
    travar(true);
    esconderTestes();
    limparErroDaLinha();
    mostrarSaida('', '');

    try {
      if (!(await garantirMotor())) return;

      const resultados = [];
      let parou = false;
      for (let i = 0; i < exercicio.testes.length; i++) {
        const teste = exercicio.testes[i];
        if (parou) { resultados.push({ estado: 'pulado', teste }); continue; }

        definirStatus('executando', 'Testando ' + (i + 1) + ' de ' + exercicio.testes.length + '…');
        const r = await motor.rodar(ta.value, teste.entrada);

        if (r.tempo) {
          resultados.push({ estado: 'tempo', teste });
          parou = true;
        } else {
          const igual = !r.erro && normalizar(r.saida) === normalizar(teste.saida);
          resultados.push({ estado: igual ? 'ok' : 'falhou', teste, saida: r.saida, erro: r.erro, linha: r.linha });
        }
      }

      const passou = resultados.every((r) => r.estado === 'ok');
      definirStatus(passou ? 'ok' : 'erro', passou ? 'Todos os testes passaram' : 'Alguns testes falharam');
      mostrarTestes(resultados);

      if (passou) {
        marcarResolvido();
        NivelDevUI.toast('Exercício resolvido!', 'sucesso');
      } else {
        const primeiroErro = resultados.find((r) => r.erro && r.linha);
        if (primeiroErro) { linhaErro = primeiroErro.linha; desenharEditor(); }
      }
    } finally {
      ocupado = false;
      travar(false);
    }
  }

  btnExecutar.addEventListener('click', executar);
  btnEnviar.addEventListener('click', enviar);

  /* ---------- INÍCIO ---------- */
  motor.iniciar();
  garantirMotor().then((ok) => {
    if (ok && !ocupado) definirStatus('espera', 'Pronto para executar');
  });
})();
