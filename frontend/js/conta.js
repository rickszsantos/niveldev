/* ============================================================
   NívelDev — telas Meu Perfil, Meu Progresso e Ajustes
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
    estrela: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z"/>',
    check:   '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    livro:   '<path d="M12 6.5C10.4 5.3 8 4.7 4 4.7v13.6c4 0 6.4.6 8 1.8 1.6-1.2 4-1.8 8-1.8V4.7c-4 0-6.4.6-8 1.8z"/><path d="M12 6.5v13.6"/>',
  };

  /* ---------- DADOS DE EXEMPLO (troque pela API quando existir) ---------- */
  const progresso = {
    exercicios: 8,
    cursos: [
      { titulo: 'Lógica de Programação', pct: 65 },
      { titulo: 'HTML e CSS',            pct: 100 },
      { titulo: 'Git e GitHub',          pct: 100 },
    ],
    skills: [
      { nome: 'Lógica de programação', pct: 72 },
      { nome: 'HTML',                  pct: 58 },
      { nome: 'CSS',                   pct: 45 },
      { nome: 'JavaScript',            pct: 22 },
      { nome: 'Git',                   pct: 30 },
      { nome: 'SQL',                   pct: 10 },
    ],
    // exercícios por dia (últimos 7 dias, terminando hoje) e por semana (últimas 4)
    ultimos7: [0, 0, 1, 2, 1, 1, 1],
    semanas:  [1, 1, 0, 6],
    atividades: [
      { icone: 'codigo',  texto: 'Resolveu "Soma de dois números"', quando: 'Hoje, 09:12',  xp: 40 },
      { icone: 'check',   texto: 'Concluiu a aula "Estruturas de repetição"', quando: 'Ontem', xp: 25 },
      { icone: 'codigo',  texto: 'Resolveu "Par ou ímpar"', quando: 'Ontem', xp: 40 },
      { icone: 'estrela', texto: 'Subiu para o nível 7', quando: 'Há 3 dias', xp: 0 },
      { icone: 'livro',   texto: 'Concluiu o curso "Git e GitHub"', quando: 'Há 5 dias', xp: 120 },
    ],
    conquistas: [
      { icone: 'codigo',  titulo: 'Primeiro código', desc: 'Resolveu o 1º exercício', liberada: true },
      { icone: 'estrela', titulo: 'Nível 5',         desc: 'Chegou ao nível 5',       liberada: true },
      { icone: 'check',   titulo: 'Dez exercícios',  desc: 'Conclua 10 exercícios',   liberada: false },
    ],
  };

  const nivelDe = (pct) => (pct >= 67 ? ['Avançado', 'avancado'] : pct >= 34 ? ['Intermediário', 'intermediario'] : ['Iniciante', 'iniciante']);

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

  function dataCadastro(u) {
    const bruto = u && (u.created_at || u.createdAt || u.criado_em);
    const d = bruto ? new Date(bruto) : null;
    if (!d || isNaN(d)) return 'Não informado';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function pintarAvatar(el, nome, foto) {
    el.textContent = foto ? '' : iniciais(nome);
    el.style.backgroundImage = foto ? 'url("' + foto + '")' : '';
  }

  /* ============================================================
     MEU PERFIL
     ============================================================ */
  function desenharPerfil() {
    const nome = (usuario && usuario.nome) || 'Aluno';
    $('perfil-nome').textContent = nome;
    $('perfil-username').textContent = perfil.username || usernamePadrao(usuario);
    $('perfil-email').textContent = (usuario && usuario.email) || '—';
    $('perfil-desde').textContent = dataCadastro(usuario);
    $('perfil-visib').textContent = prefs.visibilidade === 'privado' ? 'Privado' : 'Público';

    const bio = $('perfil-bio');
    bio.textContent = perfil.bio || 'Você ainda não escreveu uma biografia. Use "Editar perfil" para contar quem você é.';
    bio.classList.toggle('is-vazia', !perfil.bio);

    pintarAvatar($('perfil-avatar'), nome, perfil.foto);

    const concluidos = progresso.cursos.filter((c) => c.pct >= 100);
    $('perfil-n-cursos').textContent = concluidos.length;
    $('perfil-cursos').innerHTML = concluidos.length
      ? concluidos.map((c) => '<li><span class="resumo-icone">' + svg(ICONES.livro) + '</span><span></span></li>').join('')
      : '<li class="resumo-vazio">Nenhum curso concluído ainda.</li>';
    $('perfil-cursos').querySelectorAll('li > span:last-child').forEach((el, i) => { el.textContent = concluidos[i].titulo; });

    const liberadas = progresso.conquistas.filter((q) => q.liberada);
    $('perfil-n-conq').textContent = liberadas.length;
    $('perfil-conquistas').innerHTML = liberadas.length
      ? liberadas.map(() => '<li><span class="resumo-icone"></span><span><b></b><small></small></span></li>').join('')
      : '<li class="resumo-vazio">Resolva exercícios para desbloquear conquistas.</li>';
    $('perfil-conquistas').querySelectorAll('li:not(.resumo-vazio)').forEach((li, i) => {
      li.querySelector('.resumo-icone').innerHTML = svg(ICONES[liberadas[i].icone]);
      li.querySelector('b').textContent = liberadas[i].titulo;
      li.querySelector('small').textContent = liberadas[i].desc;
    });
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
     MEU PROGRESSO
     ============================================================ */
  function desenharProgresso() {
    const concluidos = progresso.cursos.filter((c) => c.pct >= 100).length;
    const andamento = progresso.cursos.length - concluidos;
    NivelDevUI.contar($('prog-exercicios'), progresso.exercicios);
    NivelDevUI.contar($('prog-concluidos'), concluidos);
    NivelDevUI.contar($('prog-andamento'), andamento);
    NivelDevUI.contar($('prog-skills'), progresso.skills.length);

    $('skills').innerHTML = progresso.skills.map((s) => {
      const [rotulo, classe] = nivelDe(s.pct);
      return '<li><div class="linha-topo"><strong></strong><span class="nivel-tag nivel-tag--' + classe + '">' + rotulo + '</span></div>' +
        '<div class="app-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + s.pct + '"><span data-w="' + s.pct + '"></span></div></li>';
    }).join('');
    $('skills').querySelectorAll('strong').forEach((el, i) => { el.textContent = progresso.skills[i].nome; });

    $('cursos-prog').innerHTML = progresso.cursos.map((c) =>
      '<li><div class="linha-topo"><strong></strong><span>' + (c.pct >= 100 ? 'Concluído' : c.pct + '%') + '</span></div>' +
      '<div class="app-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + c.pct + '"><span data-w="' + c.pct + '"></span></div></li>'
    ).join('');
    $('cursos-prog').querySelectorAll('strong').forEach((el, i) => { el.textContent = progresso.cursos[i].titulo; });

    $('historico').innerHTML = progresso.atividades.map((a) =>
      '<li><span class="resumo-icone">' + svg(ICONES[a.icone]) + '</span><div><strong></strong><small>' + a.quando + '</small></div>' +
      (a.xp ? '<span class="xp">+' + a.xp + ' XP</span>' : '') + '</li>'
    ).join('');
    $('historico').querySelectorAll('strong').forEach((el, i) => { el.textContent = progresso.atividades[i].texto; });

    desenharGrafico(periodo);
    animarBarras();
  }

  function animarBarras() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('#view-progresso .app-barra span[data-w]').forEach((el) => { el.style.width = el.dataset.w + '%'; });
    }));
  }

  /* gráfico de barras (sem biblioteca) */
  let periodo = 7;

  function desenharGrafico(dias) {
    const hoje = new Date();
    let valores, rotulos;
    if (dias === 7) {
      valores = progresso.ultimos7;
      rotulos = valores.map((_, i) => {
        const d = new Date(hoje); d.setDate(hoje.getDate() - (6 - i));
        return i === 6 ? 'Hoje' : d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      });
    } else {
      valores = progresso.semanas;
      rotulos = valores.map((_, i) => (i === valores.length - 1 ? 'Esta semana' : 'Há ' + (valores.length - 1 - i) + ' sem.'));
    }
    const maximo = Math.max(4, Math.max.apply(null, valores));
    const total = valores.reduce((a, b) => a + b, 0);

    $('grafico-total').textContent = total + (total === 1 ? ' exercício' : ' exercícios') + ' nos últimos ' + dias + ' dias';
    $('grafico').setAttribute('aria-label', 'Exercícios resolvidos: ' + rotulos.map((r, i) => r + ' ' + valores[i]).join(', '));

    $('grafico').innerHTML = valores.map((v, i) =>
      '<div class="barra' + (v === 0 ? ' is-zero' : '') + (i === valores.length - 1 ? ' is-hoje' : '') + '">' +
        '<span class="barra-n">' + v + '</span><span class="barra-valor"></span><span class="barra-rotulo">' + rotulos[i] + '</span></div>'
    ).join('');

    const barras = $('grafico').querySelectorAll('.barra');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      barras.forEach((b, i) => {
        const pct = (valores[i] / maximo) * 100;
        b.style.setProperty('--h', pct + '%');
        b.querySelector('.barra-valor').style.height = valores[i] ? pct + '%' : '';
      });
    }));
  }

  document.querySelectorAll('[data-periodo]').forEach((b) => b.addEventListener('click', () => {
    periodo = Number(b.dataset.periodo);
    document.querySelectorAll('[data-periodo]').forEach((x) => {
      x.classList.toggle('is-ativo', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    desenharGrafico(periodo);
  }));

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

  // ao abrir "Meu Progresso" as barras e o gráfico crescem de novo
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#progresso') desenharProgresso();
  });
})();
