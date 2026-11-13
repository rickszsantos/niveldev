/* ============================================================
   NívelDev — telas Perfil, Progresso e Ajustes
   (as três ficam dentro de home.html)

   ATENÇÃO: ainda não existe API de perfil, progresso, troca de
   senha/e-mail ou exclusão de conta. Por isso:
   - perfil e preferências ficam salvos neste navegador (localStorage);
   - os números de progresso são EXEMPLOS (iguais aos da home);
   - senha, e-mail e exclusão validam o formulário mas ainda não
     chamam o servidor (veja os TODO).
   Depende de js/auth.js, js/ui.js, js/layout.js e js/preferencias.js.
   ============================================================ */

(function () {
  const $ = (id) => document.getElementById(id);
  const svg = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>';

  const ICONES = {
    codigo:  '<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/><path d="M13.5 5l-3 14"/>',
    trofeu:  '<path d="M8 4h8v5a4 4 0 01-8 0V4z"/><path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M9 20h6M10 17h4"/>',
    chama:   '<path d="M12 2.5c.6 3.2 4.5 5.4 4.5 10a4.5 4.5 0 01-9 0c0-1.7.8-2.8 1.7-3.7.3 1.2.9 1.9 1.6 2.2C10.4 8.2 10.6 5 12 2.5z"/>',
    cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/><path d="M12 15v2"/>',
    coroa:   '<path d="M3.5 8l4.5 4 4-6.5 4 6.5 4.5-4-2 10.5h-13L3.5 8z"/>',
    estrela: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>',
    livro:   '<path d="M12 6.5C10.4 5.3 8 4.7 4 4.7v13.6c4 0 6.4.6 8 1.8 1.6-1.2 4-1.8 8-1.8V4.7c-4 0-6.4.6-8 1.8z"/><path d="M12 6.5v13.6"/>',
  };

  /* cores das medalhas: [claro, escuro] do degradê */
  const CORES = {
    azul:   ['#4b86ff', '#1547d6'],
    dourado:['#ffcf4a', '#f59e0b'],
    roxo:   ['#9a7cf8', '#6a3de8'],
    cinza:  ['#c9ccd6', '#9a9fae'],
    verde:  ['#3fdc9e', '#0fb27a'],
  };

  /* ---------- DADOS DE EXEMPLO (troque pela API quando existir) ----------
     Perfil e Progresso leem deste mesmo objeto, então os números sempre batem. */
  const progresso = {
    exercicios: 48,
    pontos: 1250,
    conclusaoCurso: 68,                    // 0 a 100
    semanas: [30, 45, 60, 68, 75],         // % de conclusão ao fim de cada semana
    // as 4 primeiras aparecem no Perfil e as 5 primeiras em Progresso
    conquistas: [
      { icone: 'codigo',  cor: 'azul',    titulo: 'Primeiro Exercício',   liberada: true  },
      { icone: 'trofeu',  cor: 'dourado', titulo: '10 Exercícios',        liberada: true  },
      { icone: 'chama',   cor: 'roxo',    titulo: 'Sequência de 7 dias',  liberada: true  },
      { icone: 'cadeado', cor: 'cinza',   titulo: 'Explorador NívelDev',  liberada: false },
      { icone: 'coroa',   cor: 'verde',   titulo: 'Mestre dos Exercícios', liberada: true },
      { icone: 'estrela', cor: 'azul',    titulo: 'Nível 5',              liberada: true  },
      { icone: 'livro',   cor: 'dourado', titulo: 'Primeiro Curso',       liberada: true  },
      { icone: 'codigo',  cor: 'roxo',    titulo: '25 Exercícios',        liberada: true  },
    ],
    atividades: [
      { texto: 'Você concluiu o exercício "Estruturas de Repetição"', quando: 'há 2 horas' },
      { texto: 'Você ganhou a conquista "10 Exercícios"',             quando: 'há 1 dia'   },
      { texto: 'Você iniciou a trilha de Python',                     quando: 'há 2 dias'  },
    ],
  };

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const totalConquistas = () => progresso.conquistas.filter((q) => q.liberada).length;

  /* ---------- PREFERÊNCIAS E PERFIL (localStorage) ---------- */
  const lerJson = (chave, padrao) => {
    try { return Object.assign({}, padrao, JSON.parse(localStorage.getItem(chave) || '{}')); }
    catch (e) { return Object.assign({}, padrao); }
  };
  const gravarJson = (chave, valor) => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }
  };

  const PADRAO_PREFS = {
    notif: true, notifAtividades: true, notifCursos: true,
    visibilidade: 'publico', mostrarEmail: false, mostrarProgresso: true, mostrarConquistas: true,
  };
  const CHAVE_PREFS = 'niveldev_ajustes';
  let prefs = lerJson(CHAVE_PREFS, PADRAO_PREFS);

  let usuario = null;
  let perfil = { username: '', bio: '', foto: '' };

  const chavePerfil = () => 'niveldev_perfil_' + (usuario && (usuario.id || usuario.email));

  const usernamePadrao = (u) => {
    const base = ((u && u.email) || (u && u.nome) || 'aluno').split('@')[0];
    return base.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 24) || 'aluno';
  };

  const iniciais = (nome) => {
    const p = (nome || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '?';
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  };

  function pintarAvatar(el, nome, foto) {
    el.textContent = foto ? '' : iniciais(nome);
    el.style.backgroundImage = foto ? 'url("' + foto + '")' : '';
  }

  function dataCurta(u) {
    const bruto = u && (u.created_at || u.createdAt || u.criado_em);
    const d = bruto ? new Date(bruto) : null;
    if (!d || isNaN(d)) return 'Não informado';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /* medalha hexagonal (SVG, com cantos arredondados) */
  let seqMedalha = 0;
  function medalha(q) {
    const id = 'hex' + (++seqMedalha);
    const [c1, c2] = CORES[q.cor] || CORES.azul;
    return '<li class="medalha' + (q.liberada ? '' : ' is-bloqueada') + '">' +
      '<svg class="hex" viewBox="0 0 80 80" aria-hidden="true">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
        '<polygon points="40,8 68,24 68,56 40,72 12,56 12,24" fill="url(#' + id + ')" stroke="url(#' + id + ')" stroke-width="8" stroke-linejoin="round"/>' +
        '<g transform="translate(24 24) scale(1.35)" class="icone">' + ICONES[q.icone] + '</g>' +
      '</svg><span>' + esc(q.titulo) + '</span></li>';
  }

  const linhaTempo = (lista) => lista.map((a) => '<li><strong>' + esc(a.texto) + '</strong><small>' + esc(a.quando) + '</small></li>').join('');

  /* ============================================================
     PERFIL
     ============================================================ */
  const ICONE_PESSOA = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21c0-4.5 3.7-7.2 8.2-7.2s8.2 2.7 8.2 7.2z"/></svg>';

  function desenharPerfil() {
    const nome = (usuario && usuario.nome) || 'Aluno';
    const email = (usuario && usuario.email) || '—';

    $('perfil-nome').textContent = nome;
    $('perfil-nome-completo').textContent = nome;
    $('perfil-email-topo').textContent = email;
    $('perfil-email').textContent = email;
    $('perfil-documento').textContent = (usuario && (usuario.documento || usuario.cpf)) || 'Não informado';
    $('perfil-desde').textContent = dataCurta(usuario);

    // sem foto: ícone de pessoa; com foto: a imagem escolhida em "Editar"
    const av = $('perfil-avatar');
    av.innerHTML = perfil.foto ? '' : ICONE_PESSOA;
    av.style.backgroundImage = perfil.foto ? 'url("' + perfil.foto + '")' : '';

    // resumo de progresso
    const pct = progresso.conclusaoCurso;
    NivelDevUI.contar($('perfil-pct'), pct);
    $('perfil-barra').setAttribute('aria-valuenow', String(pct));
    NivelDevUI.contar($('perfil-ex'), progresso.exercicios);
    NivelDevUI.contar($('perfil-conq-n'), totalConquistas());
    NivelDevUI.contar($('perfil-pontos'), progresso.pontos);

    $('perfil-conquistas').innerHTML = progresso.conquistas.slice(0, 4).map(medalha).join('');
    $('perfil-atividades').innerHTML = linhaTempo(progresso.atividades);

    // a barra cresce com animação (pequeno atraso para a transição valer)
    $('perfil-barra-fill').style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => { $('perfil-barra-fill').style.width = pct + '%'; }));
  }

  /* ----- edição (diálogo) ----- */
  const dlg = $('dlg-perfil');
  let fotoTemp = '';

  function abrirEdicao() {
    $('dlg-nome').value = (usuario && usuario.nome) || '';
    $('dlg-username').value = perfil.username || usernamePadrao(usuario);
    $('dlg-bio').value = perfil.bio || '';
    $('dlg-bio-n').textContent = $('dlg-bio').value.length;
    $('dlg-erro').textContent = '';
    fotoTemp = perfil.foto || '';
    pintarAvatar($('dlg-avatar'), $('dlg-nome').value, fotoTemp);
    dlg.showModal();
    $('dlg-nome').focus();
  }

  // reduz a foto para 256 px (cabe no localStorage e carrega rápido)
  function reduzirFoto(arquivo) {
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        c.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 256, 256);
        URL.revokeObjectURL(url);
        ok(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('imagem inválida')); };
      img.src = url;
    });
  }

  $('btn-editar-perfil').addEventListener('click', abrirEdicao);
  $('dlg-cancelar').addEventListener('click', () => dlg.close());
  $('dlg-bio').addEventListener('input', () => { $('dlg-bio-n').textContent = $('dlg-bio').value.length; });
  $('dlg-nome').addEventListener('input', () => pintarAvatar($('dlg-avatar'), $('dlg-nome').value, fotoTemp));
  $('dlg-foto-remover').addEventListener('click', () => { fotoTemp = ''; pintarAvatar($('dlg-avatar'), $('dlg-nome').value, ''); });

  $('dlg-foto-arquivo').addEventListener('change', async (e) => {
    const arq = e.target.files[0];
    e.target.value = '';
    if (!arq) return;
    if (!/^image\/(png|jpeg|webp)$/.test(arq.type)) { $('dlg-erro').textContent = 'Use uma imagem JPG, PNG ou WebP.'; return; }
    try {
      fotoTemp = await reduzirFoto(arq);
      $('dlg-erro').textContent = '';
      pintarAvatar($('dlg-avatar'), $('dlg-nome').value, fotoTemp);
    } catch (err) {
      $('dlg-erro').textContent = 'Não foi possível ler essa imagem. Tente outra.';
    }
  });

  $('form-perfil').addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = $('dlg-nome').value.trim();
    const username = $('dlg-username').value.trim().replace(/^@/, '').toLowerCase();
    if (nome.length < 2) { $('dlg-erro').textContent = 'Digite seu nome completo.'; return; }
    if (!/^[a-z0-9_.]{3,24}$/.test(username)) { $('dlg-erro').textContent = 'O nome de usuário precisa ter de 3 a 24 letras minúsculas, números, "." ou "_".'; return; }

    perfil = { username, bio: $('dlg-bio').value.trim(), foto: fotoTemp };
    // TODO: enviar nome/usuário/bio/foto para a API quando existir; por enquanto só neste navegador
    usuario = Object.assign({}, usuario, { nome });
    const ok = gravarJson(chavePerfil(), perfil);
    try {
      const alvo = localStorage.getItem('niveldev_user') ? localStorage : sessionStorage;
      alvo.setItem('niveldev_user', JSON.stringify(usuario));
    } catch (err) { /* sem storage */ }

    dlg.close();
    desenharPerfil();
    NivelDevLayout.atualizarAvatar();
    NivelDevUI.toast(ok ? 'Perfil atualizado.' : 'Perfil atualizado, mas não foi possível salvar neste navegador.', ok ? 'sucesso' : 'info');
  });

  // clicar fora do diálogo fecha
  [dlg, $('dlg-excluir')].forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

  /* ============================================================
     PROGRESSO
     ============================================================ */
  const incentivo = (pct) => (pct >= 60 ? 'Você está indo muito bem!' : pct >= 30 ? 'Bom ritmo, continue assim!' : 'Comece hoje a sua jornada!');

  function desenharProgresso() {
    const pct = progresso.conclusaoCurso;

    NivelDevUI.contar($('prog-exercicios'), progresso.exercicios);
    NivelDevUI.contar($('prog-pontos'), progresso.pontos);
    NivelDevUI.contar($('prog-conquistas'), totalConquistas());
    NivelDevUI.contar($('prog-pct'), pct);

    // anel de progresso geral
    NivelDevUI.contar($('prog-anel-pct'), pct);
    $('prog-pct-texto').textContent = pct;
    $('prog-incentivo').textContent = incentivo(pct);
    $('prog-anel-box').setAttribute('aria-label', 'Conclusão do curso: ' + pct + '%');
    $('prog-anel').style.strokeDashoffset = '100';

    $('prog-medalhas').innerHTML = progresso.conquistas.slice(0, 5).map(medalha).join('');
    $('prog-atividades').innerHTML = linhaTempo(progresso.atividades);

    desenharGrafico();

    requestAnimationFrame(() => requestAnimationFrame(() => {
      $('prog-anel').style.strokeDashoffset = String(100 - pct);
    }));
  }

  /* gráfico de barras por semana (sem biblioteca) */
  function desenharGrafico() {
    const valores = progresso.semanas;
    const rotulos = valores.map((_, i) => 'Semana ' + (i + 1));

    $('grafico').setAttribute('aria-label', 'Desempenho por semana: ' + rotulos.map((r, i) => r + ' ' + valores[i] + '%').join(', '));
    $('grafico').innerHTML =
      '<ul class="pg-y" aria-hidden="true"><li>100%</li><li>75%</li><li>50%</li><li>25%</li><li>0%</li></ul>' +
      '<div class="pg-plot"><div class="pg-cols">' +
        valores.map((v) => '<div class="pg-col"><span class="pg-bar-n">' + v + '%</span><span class="pg-bar"></span></div>').join('') +
      '</div></div>' +
      '<div class="pg-x" aria-hidden="true">' + rotulos.map((r) => '<span>' + r + '</span>').join('') + '</div>';

    const colunas = $('grafico').querySelectorAll('.pg-col');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      colunas.forEach((c, i) => {
        c.style.setProperty('--h', valores[i] + '%');
        c.querySelector('.pg-bar').style.height = valores[i] + '%';
      });
    }));
  }

  /* ============================================================
     AJUSTES
     ============================================================ */

  /* ----- aparência ----- */
  function marcarTema() {
    const atual = NivelDevPrefs.tema();
    document.querySelectorAll('.tema-op').forEach((b) => {
      const on = b.dataset.tema === atual;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $('view-ajustes').querySelector('.temas').dataset.ativo = atual; // pinta a prévia
  }
  document.querySelectorAll('.tema-op').forEach((b) => b.addEventListener('click', () => {
    NivelDevPrefs.definirTema(b.dataset.tema);
    marcarTema();
  }));

  // setas do teclado trocam o tema (padrão de grupo de opções)
  $('view-ajustes').querySelector('.temas').addEventListener('keydown', (e) => {
    if (!/^Arrow/.test(e.key)) return;
    e.preventDefault();
    NivelDevPrefs.definirTema(NivelDevPrefs.tema() === 'claro' ? 'escuro' : 'claro');
    marcarTema();
    document.querySelector('.tema-op[aria-checked="true"]').focus();
  });

  /* ----- notificações e privacidade ----- */
  function pintarChaves() {
    document.querySelectorAll('.chave[data-pref]').forEach((c) => {
      c.setAttribute('aria-checked', String(!!prefs[c.dataset.pref]));
    });
    // com as notificações desligadas, os avisos específicos ficam apagados
    document.querySelectorAll('[data-depende="notif"]').forEach((li) => {
      li.classList.toggle('is-desligado', !prefs.notif);
      li.querySelector('.chave').disabled = !prefs.notif;
    });
    document.querySelectorAll('[data-visib]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.visib === prefs.visibilidade)));
    $('visib-nota').textContent = prefs.visibilidade === 'publico'
      ? 'Qualquer aluno da plataforma pode ver o seu perfil.'
      : 'Só você vê o seu perfil. Os itens abaixo valem apenas quando ele é público.';
    document.querySelectorAll('#view-ajustes .ajuste-bloco:nth-of-type(3) .chave').forEach((c) => {
      c.disabled = prefs.visibilidade === 'privado';
      c.closest('li').classList.toggle('is-desligado', prefs.visibilidade === 'privado');
    });
  }

  document.querySelectorAll('.chave[data-pref]').forEach((c) => c.addEventListener('click', () => {
    prefs[c.dataset.pref] = !prefs[c.dataset.pref];
    gravarJson(CHAVE_PREFS, prefs);
    pintarChaves();
  }));

  document.querySelectorAll('[data-visib]').forEach((b) => b.addEventListener('click', () => {
    prefs.visibilidade = b.dataset.visib;
    gravarJson(CHAVE_PREFS, prefs);
    pintarChaves();
    desenharPerfil();
  }));

  /* ----- conta e segurança ----- */
  function alternarForm(id, abrir) {
    const form = $(id);
    form.hidden = !abrir;
    document.querySelectorAll('[data-abre="' + id + '"]').forEach((b) => b.setAttribute('aria-expanded', String(abrir)));
    if (abrir) { const campo = form.querySelector('input'); if (campo) campo.focus(); }
    else { const f = form.querySelector('form'); if (f) { f.reset(); f.querySelector('.mini-erro').textContent = ''; } }
  }

  document.querySelectorAll('[data-abre]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.abre;
    alternarForm(id, $(id).hidden);
  }));
  document.querySelectorAll('[data-fecha]').forEach((b) => b.addEventListener('click', () => alternarForm(b.dataset.fecha, false)));

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.querySelector('[data-form="senha"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const erro = f.querySelector('.mini-erro');
    const { atual, nova, confirma } = f.elements;
    if (!atual.value) { erro.textContent = 'Digite a senha atual.'; return; }
    if (nova.value.length < 8) { erro.textContent = 'A nova senha precisa ter pelo menos 8 caracteres.'; return; }
    if (nova.value === atual.value) { erro.textContent = 'A nova senha precisa ser diferente da atual.'; return; }
    if (nova.value !== confirma.value) { erro.textContent = 'As senhas novas não são iguais.'; return; }
    erro.textContent = '';
    // TODO: chamar a API de troca de senha quando existir
    NivelDevUI.toast('Troca de senha ainda em desenvolvimento: nada foi alterado.', 'info');
    alternarForm('form-senha', false);
  });

  document.querySelector('[data-form="email"]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const erro = f.querySelector('.mini-erro');
    if (!EMAIL_REGEX.test(f.elements.email.value.trim())) { erro.textContent = 'Digite um e-mail válido.'; return; }
    if (!f.elements.senha.value) { erro.textContent = 'Digite a senha atual para confirmar.'; return; }
    erro.textContent = '';
    // TODO: chamar a API de troca de e-mail quando existir
    NivelDevUI.toast('Troca de e-mail ainda em desenvolvimento: nada foi alterado.', 'info');
    alternarForm('form-email', false);
  });

  $('btn-encerrar').addEventListener('click', () => {
    // TODO: quando a API listar sessões, encerrar também as dos outros dispositivos
    NivelDevAuth.logout();
    window.location.href = 'login.html';
  });

  /* excluir conta */
  const dlgExcluir = $('dlg-excluir');
  $('btn-excluir').addEventListener('click', () => {
    $('dlg-excluir-texto').value = '';
    $('dlg-excluir-ok').disabled = true;
    dlgExcluir.showModal();
    $('dlg-excluir-texto').focus();
  });
  $('dlg-excluir-cancelar').addEventListener('click', () => dlgExcluir.close());
  $('dlg-excluir-texto').addEventListener('input', () => {
    $('dlg-excluir-ok').disabled = $('dlg-excluir-texto').value.trim().toUpperCase() !== 'EXCLUIR';
  });
  $('form-excluir').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('dlg-excluir-texto').value.trim().toUpperCase() !== 'EXCLUIR') return;
    // TODO: chamar a API de exclusão e, só então, encerrar a sessão
    dlgExcluir.close();
    NivelDevUI.toast('Exclusão de conta ainda em desenvolvimento: sua conta continua ativa.', 'info');
  });

  /* ============================================================
     INÍCIO
     ============================================================ */
  NivelDevLayout.usuario((u) => {
    usuario = u || {};
    perfil = lerJson(chavePerfil(), { username: '', bio: '', foto: '' });
    $('aj-email').textContent = usuario.email || '—';
    desenharPerfil();
  });

  marcarTema();
  pintarChaves();
  desenharProgresso();

  // "Ver todas" (telas ainda não criadas)
  document.querySelectorAll('[data-em-breve]').forEach((b) => b.addEventListener('click', () => {
    NivelDevUI.toast(b.dataset.emBreve + ' ainda está em desenvolvimento.', 'info');
  }));

  // ao abrir Perfil ou Progresso, barras, anel e gráfico crescem de novo
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#progresso') desenharProgresso();
    if (window.location.hash === '#perfil') desenharPerfil();
  });
})();
