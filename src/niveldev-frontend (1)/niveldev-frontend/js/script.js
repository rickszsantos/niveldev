/* ============================================================
   NívelDev — script inicial
   Por enquanto só tem os "ganchos" básicos (rolagem e o botão
   de cadastro). Conforme o back-end do Carlos for ficando pronto,
   dá pra trocar o alert() por uma chamada fetch() de verdade.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Botão principal de cadastro (bloco final da página)
  const botaoCadastro = document.getElementById('cta-cadastro-btn');

  if (botaoCadastro) {
    botaoCadastro.addEventListener('click', (evento) => {
      evento.preventDefault();

      // TODO: trocar por navegação para a página de cadastro
      // (ou por um fetch() para a API do back-end, quando existir)
      console.log('Cadastro clicado — ligar isso na página/rota de cadastro.');
      alert('Página de cadastro ainda não implementada.');
    });
  }

});
