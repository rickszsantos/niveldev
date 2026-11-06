/* ============================================================
   NívelDev — tela de carregamento (entre o login e a home)
   1) Sem sessão (alguém abriu esta página direto): volta ao login
   2) Espera um tempo mínimo (para a animação aparecer inteira) e,
      ao mesmo tempo, confirma o token com o servidor
   3) Token inválido → login; caso contrário → home.html
   Depende de js/auth.js (window.NivelDevAuth).
   ============================================================ */

(function () {
  var TEMPO_MINIMO = 1400; // ms: duração da barra de progresso (deixe igual ao da animação no CSS)

  if (!window.NivelDevAuth || !NivelDevAuth.getToken()) {
    window.location.replace('login.html');
    return;
  }

  var espera = new Promise(function (ok) { setTimeout(ok, TEMPO_MINIMO); });

  // confirma o token; só um 401 manda de volta ao login (servidor fora do ar não trava a entrada)
  var sessao = NivelDevAuth.api.me().then(
    function () { return true; },
    function (erro) { return erro.status !== 401; }
  );

  // já aquece o que a home vai usar
  ['css/style.css', 'css/app-base.css', 'css/home.css', 'js/layout.js', 'js/home.js', 'img/cursos/logica.jpg'].forEach(function (url) {
    var l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = url;
    document.head.appendChild(l);
  });

  Promise.all([espera, sessao]).then(function (r) {
    var destino = r[1] ? 'home.html' : 'login.html';
    if (!r[1]) NivelDevAuth.logout();

    var tela = document.getElementById('carregando');
    tela.classList.add('is-saindo');
    // replace: o botão "voltar" não retorna para a tela de carregamento
    setTimeout(function () { window.location.replace(destino); }, 250);
  });
})();
