/* ============================================================
   NívelDev — pequenos componentes de interface
   NivelDevUI.toast('Mensagem', 'sucesso' | 'erro' | 'info')
   NivelDevUI.contar(elemento, 1240)   // número que "sobe" até o valor
   NivelDevUI.esqueletos(elemento, 6, 'ex-card')  // blocos cinza de carregamento
   ============================================================ */

(function () {
  const reduzido = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast (aviso rápido no canto da tela) ---------- */
  const ICONES = {
    sucesso: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    erro:    '<path d="M12 8v5M12 16.5h.01"/><circle cx="12" cy="12" r="9"/>',
    info:    '<path d="M12 11v5M12 7.5h.01"/><circle cx="12" cy="12" r="9"/>',
  };

  function toast(mensagem, tipo) {
    tipo = ICONES[tipo] ? tipo : 'info';
    let pilha = document.getElementById('toast-pilha');
    if (!pilha) {
      pilha = document.createElement('div');
      pilha.id = 'toast-pilha';
      pilha.className = 'toast-pilha';
      pilha.setAttribute('role', 'status');
      pilha.setAttribute('aria-live', 'polite');
      document.body.appendChild(pilha);
    }

    const el = document.createElement('div');
    el.className = 'toast toast--' + tipo;
    el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONES[tipo] + '</svg><span></span>';
    el.querySelector('span').textContent = mensagem; // textContent: nunca interpreta HTML
    pilha.appendChild(el);

    setTimeout(() => {
      el.classList.add('is-saindo');
      setTimeout(() => el.remove(), 250);
    }, 3200);
  }

  /* ---------- Número que sobe até o valor final ---------- */
  function contar(el, valor, duracao) {
    if (!el) return;
    const formato = (n) => Math.round(n).toLocaleString('pt-BR');
    if (reduzido() || !valor) { el.textContent = formato(valor || 0); return; }

    duracao = duracao || 900;
    const inicio = performance.now();
    function passo(agora) {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3); // desacelera no final
      el.textContent = formato(valor * suave);
      if (t < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* ---------- Esqueletos (placeholder enquanto os dados carregam) ---------- */
  function esqueletos(el, quantidade, classe) {
    el.innerHTML = Array.from({ length: quantidade }, () =>
      '<div class="app-card esqueleto-card ' + (classe || '') + '" aria-hidden="true">' +
        '<span class="esqueleto esqueleto-icone"></span>' +
        '<span class="esqueleto-linhas"><span class="esqueleto"></span><span class="esqueleto"></span><span class="esqueleto curto"></span></span>' +
      '</div>'
    ).join('');
  }

  window.NivelDevUI = { toast, contar, esqueletos };
})();
