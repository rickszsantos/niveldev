/* ============================================================
   NívelDev — autenticação no front-end
   1) Sessão: guarda/lê o token e o usuário no navegador
   2) Chamadas à API (/auth/login, /auth/register, /auth/me)
   3) Formulários das páginas login.html e cadastro.html
   Este arquivo é carregado em todas as páginas; os formulários
   só são ativados nas páginas em que existem.
   ============================================================ */

(function () {
  const CHAVE_TOKEN = 'niveldev_token';
  const CHAVE_USUARIO = 'niveldev_user';

  /* ---------- 1) SESSÃO ----------
     O token fica no localStorage (simples e funciona com o header
     "Authorization: Bearer"). Atenção: qualquer script na página consegue
     lê-lo; por isso nunca inserimos texto do usuário via innerHTML.
     Todo acesso é protegido por try/catch porque o navegador pode
     bloquear o storage (modo privado, política de cookies etc.). */

  const lerDe = (storage, chave) => {
    try { return storage.getItem(chave); } catch (e) { return null; }
  };

  // procura nos dois: "lembrar de mim" usa localStorage; sem marcar, vale só até fechar a aba (sessionStorage)
  const ler = (chave) => lerDe(localStorage, chave) || lerDe(sessionStorage, chave);

  const salvarEm = (storage, chave, valor) => {
    try { storage.setItem(chave, valor); } catch (e) { /* sem storage: login só vale nesta página */ }
  };

  const removerDe = (storage, chave) => {
    try { storage.removeItem(chave); } catch (e) { /* ignora */ }
  };

  const getToken = () => ler(CHAVE_TOKEN);

  const getUser = () => {
    try { return JSON.parse(ler(CHAVE_USUARIO)); } catch (e) { return null; }
  };

  const salvarSessao = ({ token, user }, lembrar = true) => {
    const destino = lembrar ? localStorage : sessionStorage;
    const outro = lembrar ? sessionStorage : localStorage;
    removerDe(outro, CHAVE_TOKEN);
    removerDe(outro, CHAVE_USUARIO);
    salvarEm(destino, CHAVE_TOKEN, token);
    salvarEm(destino, CHAVE_USUARIO, JSON.stringify(user));
  };

  const logout = () => {
    [localStorage, sessionStorage].forEach((st) => {
      removerDe(st, CHAVE_TOKEN);
      removerDe(st, CHAVE_USUARIO);
    });
  };

  /* ---------- 2) API ---------- */

  async function chamarApi(caminho, { method = 'GET', corpo, autenticado = false } = {}) {
    const headers = {};
    if (corpo) headers['Content-Type'] = 'application/json';
    if (autenticado && getToken()) headers.Authorization = 'Bearer ' + getToken();

    let resposta;
    try {
      resposta = await fetch(caminho, {
        method,
        headers,
        body: corpo ? JSON.stringify(corpo) : undefined,
      });
    } catch (e) {
      const erro = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.');
      erro.status = 0;
      throw erro;
    }

    let dados = {};
    try { dados = await resposta.json(); } catch (e) { /* resposta sem corpo JSON */ }

    if (!resposta.ok) {
      const erro = new Error(dados.error || 'Algo deu errado. Tente novamente.');
      erro.status = resposta.status;
      throw erro;
    }
    return dados;
  }

  const api = {
    login: (email, password) => chamarApi('/auth/login', { method: 'POST', corpo: { email, password } }),
    cadastrar: (nome, email, password) => chamarApi('/auth/register', { method: 'POST', corpo: { nome, email, password } }),
    me: () => chamarApi('/auth/me', { autenticado: true }),
  };

  // Disponível para outros scripts (ex.: script.js usa para montar o cabeçalho)
  window.NivelDevAuth = { getToken, getUser, salvarSessao, logout, api };

  /* ---------- 3) FORMULÁRIOS ---------- */

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const SENHA_MIN = 8; // mesma regra do back-end

  const $ = (id) => document.getElementById(id);

  // mostra/limpa o erro de um campo; devolve true se o campo está ok
  function marcarCampo(campo, mensagem) {
    const caixa = campo.closest('.field');
    const texto = $(campo.id + '-erro');
    if (texto) texto.textContent = mensagem; // textContent: nunca interpreta HTML
    campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    caixa.classList.toggle('is-invalid', Boolean(mensagem));
    caixa.classList.toggle('is-valid', !mensagem && campo.value !== '');
    return !mensagem;
  }

  function mostrarAlerta(alerta, tipo, texto) {
    alerta.className = alerta.className.replace(/\bis-\w+/g, '').trim() + ' is-' + tipo;
    alerta.textContent = texto;
    alerta.hidden = false;
  }

  function carregando(botao, ativo, textoNormal, textoCarregando) {
    botao.disabled = ativo;
    botao.classList.toggle('is-loading', ativo);
    botao.setAttribute('aria-busy', String(ativo));
    botao.querySelector('.btn-text').textContent = ativo ? textoCarregando : textoNormal;
  }

  function ativarMostrarSenha() {
    document.querySelectorAll('.toggle-senha').forEach((botao) => {
      botao.addEventListener('click', () => {
        const input = $(botao.dataset.alvo);
        const mostrar = input.type === 'password';
        input.type = mostrar ? 'text' : 'password';
        botao.textContent = mostrar ? 'Ocultar' : 'Mostrar';
        botao.setAttribute('aria-pressed', String(mostrar));
        botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      });
    });
  }

  // valida ao sair do campo e, depois de um erro, a cada tecla (o erro some assim que corrige)
  function ligarValidacao(validadores, aoDigitar) {
    Object.keys(validadores).forEach((id) => {
      const campo = $(id);
      campo.addEventListener('blur', () => { if (campo.value) marcarCampo(campo, validadores[id](campo.value)); });
      campo.addEventListener('input', () => {
        if (campo.closest('.field').classList.contains('is-invalid')) marcarCampo(campo, validadores[id](campo.value));
        if (aoDigitar) aoDigitar(campo);
      });
    });
  }

  // valida tudo; foca o primeiro campo com erro; devolve true se está tudo certo
  function validarTudo(validadores) {
    const resultados = Object.keys(validadores).map((id) => marcarCampo($(id), validadores[id]($(id).value)));
    const primeiroErro = Object.keys(validadores).find((id) => $(id).getAttribute('aria-invalid') === 'true');
    if (primeiroErro) $(primeiroErro).focus();
    return !resultados.includes(false);
  }

  /* ----- LOGIN ----- */
  function iniciarLogin(form) {
    const alerta = $('login-alert');
    const botao = $('btn-entrar');

    const validadores = {
      email: (v) => (!v.trim() ? 'Informe seu e-mail.' : !EMAIL_REGEX.test(v.trim()) ? 'Digite um e-mail válido, como voce@email.com.' : ''),
      senha: (v) => (!v ? 'Informe sua senha.' : ''),
    };

    ligarValidacao(validadores, () => { alerta.hidden = true; });

    $('link-esqueci').addEventListener('click', (e) => {
      e.preventDefault();
      mostrarAlerta(alerta, 'info', 'A recuperação de senha ainda está em desenvolvimento.');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alerta.hidden = true;
      if (!validarTudo(validadores)) return;

      carregando(botao, true, 'Entrar', 'Entrando...');
      try {
        const resultado = await api.login($('email').value.trim(), $('senha').value);
        salvarSessao(resultado, $('lembrar').checked);
        mostrarAlerta(alerta, 'success', 'Login feito! Redirecionando...');
        setTimeout(() => { window.location.href = 'home.html'; }, 800);
      } catch (erro) {
        carregando(botao, false, 'Entrar', 'Entrando...');
        mostrarAlerta(alerta, 'error', erro.message);
        if (erro.status === 401) {
          $('senha').value = '';
          $('senha').focus();
        }
      }
    });
  }

  /* ----- CADASTRO ----- */
  const TEXTOS_FORCA = ['', 'Senha fraca', 'Senha razoável', 'Senha boa', 'Senha forte'];

  function calcularForca(senha) {
    if (!senha) return 0;
    let pontos = 0;
    if (senha.length >= SENHA_MIN) pontos++;
    if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
    if (/\d/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha) || senha.length >= 12) pontos++;
    return Math.max(1, pontos);
  }

  function iniciarCadastro(form) {
    const alerta = $('form-alert');
    const botao = $('btn-cadastrar');
    const medidor = form.querySelector('.strength');

    const validadores = {
      nome: (v) => {
        v = v.trim();
        if (!v) return 'Informe seu nome.';
        if (v.length < 3) return 'O nome precisa ter pelo menos 3 letras.';
        if (!/\s/.test(v)) return 'Informe nome e sobrenome.';
        return '';
      },
      email: (v) => (!v.trim() ? 'Informe seu e-mail.' : !EMAIL_REGEX.test(v.trim()) ? 'Digite um e-mail válido, como voce@email.com.' : ''),
      senha: (v) => (!v ? 'Crie uma senha.' : v.length < SENHA_MIN ? 'A senha deve ter pelo menos ' + SENHA_MIN + ' caracteres.' : ''),
      confirmar: (v) => (!v ? 'Confirme sua senha.' : v !== $('senha').value ? 'As senhas não são iguais.' : ''),
    };

    const atualizarForca = () => {
      const nivel = calcularForca($('senha').value);
      medidor.dataset.nivel = nivel;
      $('forca-texto').textContent = TEXTOS_FORCA[nivel];
    };

    ligarValidacao(validadores, (campo) => {
      if (campo.id === 'senha') {
        atualizarForca();
        if ($('confirmar').value) marcarCampo($('confirmar'), validadores.confirmar($('confirmar').value));
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alerta.hidden = true;
      if (!validarTudo(validadores)) return;

      carregando(botao, true, 'Criar minha conta grátis', 'Criando sua conta...');
      try {
        const resultado = await api.cadastrar($('nome').value.trim(), $('email').value.trim(), $('senha').value);
        salvarSessao(resultado, true); // conta nova já entra logada, como antes
        mostrarAlerta(alerta, 'success', 'Conta criada! Redirecionando...');
        setTimeout(() => { window.location.href = 'home.html'; }, 900);
      } catch (erro) {
        carregando(botao, false, 'Criar minha conta grátis', 'Criando sua conta...');
        mostrarAlerta(alerta, 'error', erro.message);
        if (erro.status === 409) { // e-mail já cadastrado
          marcarCampo($('email'), 'Este e-mail já está cadastrado.');
          $('email').focus();
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const formLogin = $('form-login');
    const formCadastro = $('form-cadastro');
    if (!formLogin && !formCadastro) return;

    ativarMostrarSenha();
    if (formLogin) iniciarLogin(formLogin);
    if (formCadastro) iniciarCadastro(formCadastro);
  });
})();
