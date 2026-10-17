/* =====================================================================
   NívelDev — login.js
   Lógica da tela de login (login.html).

   Para ligar ao back-end do Carlos:
   1. Troque API_URL pelo endereço real da rota de login.
   2. Mude USAR_API para true.
   Enquanto USAR_API for false, o login é simulado.
   ===================================================================== */

const API_URL = "http://localhost:3000/api/login"; // trocar pela rota real
const USAR_API = false;

const form = document.getElementById("form-login");
const alerta = document.getElementById("login-alert");
const botao = document.getElementById("btn-entrar");
const textoBotao = botao.querySelector(".btn-text");

/* ---------- Regras de validação ---------- */
const regras = {
  email(valor) {
    if (!valor) return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "Digite um e-mail válido, como voce@email.com.";
    return "";
  },
  senha(valor) {
    if (!valor) return "Informe sua senha.";
    return "";
  },
};

function validarCampo(campo) {
  const regra = regras[campo.name];
  if (!regra) return true;

  const mensagem = regra(campo.value.trim());
  const field = campo.closest(".field");
  const erro = document.getElementById(`${campo.id}-erro`);

  erro.textContent = mensagem;
  field.classList.toggle("is-invalid", !!mensagem);
  campo.setAttribute("aria-invalid", mensagem ? "true" : "false");
  return !mensagem;
}

/* Valida ao sair do campo e, depois de um erro, enquanto a pessoa digita */
form.querySelectorAll("input[name='email'], input[name='senha']").forEach((campo) => {
  campo.addEventListener("blur", () => validarCampo(campo));
  campo.addEventListener("input", () => {
    if (campo.closest(".field").classList.contains("is-invalid")) validarCampo(campo);
    esconderAlerta();
  });
});

/* ---------- Mostrar / ocultar senha ---------- */
document.querySelectorAll(".toggle-senha").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.alvo);
    const mostrar = input.type === "password";
    input.type = mostrar ? "text" : "password";
    btn.textContent = mostrar ? "Ocultar" : "Mostrar";
    btn.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
    btn.setAttribute("aria-pressed", String(mostrar));
  });
});

/* ---------- Alerta geral ---------- */
function mostrarAlerta(tipo, mensagem) {
  alerta.className = `login-alert is-${tipo}`;
  alerta.textContent = mensagem;
  alerta.hidden = false;
}

function esconderAlerta() {
  alerta.hidden = true;
}

/* ---------- Botão em estado de envio ---------- */
function carregando(ativo) {
  botao.disabled = ativo;
  botao.setAttribute("aria-busy", String(ativo));
  textoBotao.textContent = ativo ? "Entrando..." : "Entrar";
}

/* ---------- "Esqueci minha senha" (placeholder até existir a tela) ---------- */
document.getElementById("link-esqueci").addEventListener("click", (e) => {
  e.preventDefault();
  mostrarAlerta("info", "A recuperação de senha ainda está em desenvolvimento.");
});

/* ---------- Envio ---------- */
async function enviarLogin(dados) {
  if (!USAR_API) {
    // Simulação: espera um pouco e aceita qualquer e-mail/senha válidos
    await new Promise((r) => setTimeout(r, 900));
    return { token: "token-de-teste", usuario: { email: dados.email } };
  }

  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: dados.email, senha: dados.senha }),
  });

  if (resposta.status === 401) {
    const erro = new Error("E-mail ou senha incorretos.");
    erro.tipo = "credenciais";
    throw erro;
  }
  if (!resposta.ok) throw new Error("Não foi possível entrar agora. Tente novamente em instantes.");

  return resposta.json();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  esconderAlerta();

  const email = form.email;
  const senha = form.senha;
  const emailOk = validarCampo(email);
  const senhaOk = validarCampo(senha);

  if (!emailOk || !senhaOk) {
    (emailOk ? senha : email).focus(); // leva o foco ao primeiro campo com erro
    return;
  }

  carregando(true);
  try {
    const resultado = await enviarLogin({
      email: email.value.trim(),
      senha: senha.value,
    });

    // "Lembrar de mim": localStorage mantém a sessão após fechar o navegador;
    // sessionStorage apaga ao fechar a aba.
    const armazenamento = form.lembrar.checked ? localStorage : sessionStorage;
    try {
      armazenamento.setItem("niveldev_token", resultado.token);
      armazenamento.setItem("niveldev_usuario", JSON.stringify(resultado.usuario || {}));
    } catch (_) {
      /* navegador bloqueou o armazenamento; segue sem salvar */
    }

    mostrarAlerta("success", "Login feito! Redirecionando...");
    setTimeout(() => (window.location.href = "index.html"), 1200);
  } catch (erro) {
    carregando(false);
    mostrarAlerta("error", erro.message || "Não foi possível entrar agora.");
    if (erro.tipo === "credenciais") {
      senha.value = "";
      senha.focus();
    }
  }
});
