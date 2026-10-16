/* ==========================================================
   NívelDev — cadastro.js
   Lógica da tela de cadastro (cadastro.html).

   O que este arquivo faz:
   1. Mostrar/ocultar senha
   2. Medidor de força da senha e regras em tempo real
   3. Validação dos campos (ao sair do campo e ao enviar)
   4. Envio para a API do back-end (fetch) — com modo de teste
   ========================================================== */

/* ---------- Configuração da API ----------
   Quando o back-end do Carlos estiver pronto, troque a URL
   e mude USAR_API para true. Enquanto isso, o envio é simulado. */
const API_URL = "http://localhost:3000/api/usuarios";
const USAR_API = false;

/* ---------- Seletores ---------- */
const form = document.getElementById("form-cadastro");
const alerta = document.getElementById("form-alert");
const botao = document.getElementById("btn-cadastrar");

/* ==========================================================
   1. Mostrar / ocultar senha
   ========================================================== */
document.querySelectorAll(".toggle-senha").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.alvo);
    const mostrando = input.type === "text";

    input.type = mostrando ? "password" : "text";
    btn.textContent = mostrando ? "Mostrar" : "Ocultar";
    btn.setAttribute("aria-pressed", String(!mostrando));
    btn.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
  });
});

/* ==========================================================
   2. Força da senha
   ========================================================== */
const regrasSenha = {
  tamanho: (s) => s.length >= 8,
  maiuscula: (s) => /[A-Z]/.test(s),
  numero: (s) => /\d/.test(s),
};

function calcularForca(senha) {
  if (!senha) return 0;
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha) || senha.length >= 12) pontos++;
  return Math.max(1, pontos);
}

const textosForca = ["", "Senha fraca", "Senha razoável", "Senha boa", "Senha forte"];

function atualizarForca() {
  if (!form) return;
  const senha = form.senha.value;
  const medidor = form.querySelector(".strength");
  const rotulo = document.getElementById("forca-texto");
  const nivel = calcularForca(senha);

  medidor.dataset.nivel = nivel;
  rotulo.textContent = textosForca[nivel];

  // Marca cada regra cumprida com ✓
  form.querySelectorAll(".password-rules li").forEach((li) => {
    li.classList.toggle("ok", regrasSenha[li.dataset.regra](senha));
  });
}

/* ==========================================================
   3. Validação
   Cada função recebe o valor e devolve "" (ok) ou a mensagem de erro.
   ========================================================== */
const validadores = {
  nome(v) {
    v = v.trim();
    if (!v) return "Informe seu nome.";
    if (v.length < 3) return "O nome precisa ter pelo menos 3 letras.";
    if (!/\s/.test(v)) return "Informe nome e sobrenome.";
    return "";
  },
  email(v) {
    v = v.trim();
    if (!v) return "Informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Digite um e-mail válido, como voce@email.com.";
    return "";
  },
  nivel(v) {
    return v ? "" : "Escolha uma opção.";
  },
  senha(v) {
    if (!v) return "Crie uma senha.";
    const faltando = Object.entries(regrasSenha).filter(([, teste]) => !teste(v));
    if (faltando.length) return "A senha ainda não cumpre todas as regras abaixo.";
    return "";
  },
  confirmar(v) {
    if (!v) return "Confirme sua senha.";
    if (v !== form.senha.value) return "As senhas não são iguais.";
    return "";
  },
};

/** Valida um campo, mostra/limpa a mensagem e devolve true se estiver ok */
function validarCampo(campo) {
  const validar = validadores[campo.name];
  if (!validar) return true;

  const erro = validar(campo.value, campo);
  const caixa = campo.closest(".field");
  const msg = document.getElementById(`${campo.name}-erro`);

  msg.textContent = erro;
  campo.setAttribute("aria-invalid", erro ? "true" : "false");
  caixa.classList.toggle("is-invalid", Boolean(erro));
  caixa.classList.toggle("is-valid", !erro && campo.type !== "checkbox");

  return !erro;
}

/* ==========================================================
   4. Envio
   ========================================================== */
function mostrarAlerta(tipo, texto) {
  alerta.className = `form-alert is-${tipo}`;
  alerta.textContent = texto;
  alerta.hidden = false;
}

function carregando(ativo) {
  botao.disabled = ativo;
  botao.classList.toggle("is-loading", ativo);
  botao.querySelector(".btn-text").textContent = ativo ? "Criando sua conta..." : "Criar minha conta grátis";
}

async function enviarCadastro(dados) {
  if (!USAR_API) {
    // Simulação: espera 1s e devolve sucesso
    await new Promise((r) => setTimeout(r, 1000));
    return { ok: true };
  }

  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const corpo = await resposta.json().catch(() => ({}));
  return { ok: resposta.ok, status: resposta.status, mensagem: corpo.mensagem };
}

if (form) {
  const campos = Array.from(form.querySelectorAll("input, select"));

  campos.forEach((campo) => {
    // Valida ao sair do campo (não incomoda enquanto a pessoa digita)
    campo.addEventListener("blur", () => {
      if (campo.value || campo.type === "checkbox") validarCampo(campo);
    });

    // Se o campo já está com erro, revalida a cada tecla para o erro sumir assim que corrigir
    campo.addEventListener("input", () => {
      if (campo.closest(".field").classList.contains("is-invalid")) validarCampo(campo);
    });

    campo.addEventListener("change", () => {
      if (campo.type === "checkbox" || campo.tagName === "SELECT") validarCampo(campo);
    });
  });

  form.senha.addEventListener("input", () => {
    atualizarForca();
    // Se já digitou a confirmação, confere de novo
    if (form.confirmar.value) validarCampo(form.confirmar);
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alerta.hidden = true;

    const resultados = campos.map(validarCampo);
    if (resultados.includes(false)) {
      // Leva o foco para o primeiro campo com erro
      form.querySelector("[aria-invalid='true']").focus();
      return;
    }

    // Monta o objeto que vai para o back-end (a confirmação não precisa ir)
    const dados = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      nivel: form.nivel.value,
      senha: form.senha.value,
    };

    carregando(true);
    try {
      const resposta = await enviarCadastro(dados);

      if (resposta.ok) {
        mostrarAlerta("success", "Conta criada! Redirecionando...");
        form.reset();
        atualizarForca();
        form.querySelectorAll(".field").forEach((f) => f.classList.remove("is-valid"));
        // Troque por "login.html" quando a tela de Login existir
        setTimeout(() => (window.location.href = "index.html"), 1500);
      } else if (resposta.status === 409) {
        mostrarAlerta("error", "Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.");
        validarCampo(form.email);
        form.email.focus();
      } else {
        mostrarAlerta("error", resposta.mensagem || "Não foi possível criar a conta. Tente novamente.");
      }
    } catch (erro) {
      console.error(erro);
      mostrarAlerta("error", "Sem conexão com o servidor. Verifique sua internet e tente de novo.");
    } finally {
      carregando(false);
    }
  });
}
