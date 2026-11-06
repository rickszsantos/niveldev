/* ============================================================
   NívelDev — preferências do usuário (tema e menu lateral)
   Carregado no <head> das telas logadas (home, exercícios, categoria).
   As telas de entrada (login, cadastro, carregando) NÃO usam este
   arquivo, por isso nunca mudam com o tema:
   aplica o que foi salvo ANTES de a página ser desenhada,
   assim a tela não "pisca" de claro para escuro ao abrir.

   Uso em outros scripts:
     NivelDevPrefs.alternarTema()   // claro <-> escuro
     NivelDevPrefs.alternarMenu()   // menu completo <-> só ícones
   ============================================================ */

(function () {
  var CHAVE_TEMA = 'niveldev_tema';
  var CHAVE_MENU = 'niveldev_menu_recolhido';
  var raiz = document.documentElement;

  function ler(chave) {
    try { return localStorage.getItem(chave); } catch (e) { return null; }
  }
  function salvar(chave, valor) {
    try { localStorage.setItem(chave, valor); } catch (e) { /* sem storage: vale só até fechar a página */ }
  }

  /* ----- Tema: o que o usuário escolheu; se nunca escolheu, segue o sistema ----- */
  function temaInicial() {
    var salvo = ler(CHAVE_TEMA);
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  }

  function aplicarTema(tema) {
    raiz.setAttribute('data-theme', tema === 'escuro' ? 'dark' : 'light');
  }

  /* ----- Menu lateral recolhido ----- */
  function aplicarMenu(recolhido) {
    raiz.classList.toggle('menu-recolhido', recolhido);
  }

  aplicarTema(temaInicial());
  aplicarMenu(ler(CHAVE_MENU) === '1');

  window.NivelDevPrefs = {
    tema: function () { return raiz.getAttribute('data-theme') === 'dark' ? 'escuro' : 'claro'; },
    alternarTema: function () {
      var novo = this.tema() === 'escuro' ? 'claro' : 'escuro';
      aplicarTema(novo);
      salvar(CHAVE_TEMA, novo);
      return novo;
    },
    // define o tema direto (usado pelos cartões "Claro" e "Escuro" dos Ajustes)
    definirTema: function (tema) {
      tema = tema === 'escuro' ? 'escuro' : 'claro';
      aplicarTema(tema);
      salvar(CHAVE_TEMA, tema);
      return tema;
    },
    menuRecolhido: function () { return raiz.classList.contains('menu-recolhido'); },
    alternarMenu: function () {
      var recolhido = !this.menuRecolhido();
      aplicarMenu(recolhido);
      salvar(CHAVE_MENU, recolhido ? '1' : '0');
      return recolhido;
    }
  };

  // as animações só ligam depois do 1º desenho (o estado salvo aparece direto, sem deslizar)
  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { raiz.classList.add('pronto'); });
    });
  });
})();
