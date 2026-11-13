const ErroApp = require('../../../compartilhado/erros/ErroApp');
const registrarLog = require('../../../compartilhado/registros/registrarLog');
const exercicioRepositorio = require('../../exercicios/repositorios/exercicioRepositorio');
const casoDeTesteRepositorio = require('../../exercicios/repositorios/casoDeTesteRepositorio');
const submissaoRepositorio = require('../repositorios/submissaoRepositorio');
const { executar } = require('../../../motor-de-execucao/executor');
const { STATUS } = require('../../../motor-de-execucao/resultadoDaExecucao');
const { validarId, lerPaginacao } = require('../../usuarios/validadores');

const LINGUAGENS = ['python'];
const CODIGO_MAX = 20000;
const MAX_SIMULTANEAS = 3;

const usuariosExecutando = new Set();
let execucoesAtivas = 0;








const validarLinguagem = (valor) => {
  if (typeof valor !== 'string' || !LINGUAGENS.includes(valor)) {
    throw new ErroApp(`Linguagem inválida. Use: ${LINGUAGENS.join(', ')}.`, 400);
  }
  return valor;
};









const validarCodigo = (valor) => {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new ErroApp('Envie o código da sua solução.', 400);
  }
  if (valor.length > CODIGO_MAX) {
    throw new ErroApp(`O código é muito grande (máximo de ${CODIGO_MAX} caracteres).`, 413);
  }
  return valor;
};










const montarResposta = (id, resultado, casos) => {
  const resposta = {
    id,
    status: resultado.status,
    mensagem: resultado.mensagem,
    tempo_ms: resultado.tempoMs,
    testes_passados: resultado.testesPassados,
    total_testes: resultado.totalTestes,
    teste_falhou_indice: resultado.testeFalhouIndice,
  };

  // Só o caso de exemplo (oculto = false) pode mostrar entrada, esperado e obtido.
  const caso = resultado.testeFalhouIndice ? casos[resultado.testeFalhouIndice - 1] : null;
  if (caso && !caso.oculto && resultado.status === STATUS.RESPOSTA_INCORRETA) {
    resposta.exemplo = {
      entrada: caso.entrada,
      esperado: caso.saida_esperada,
      obtido: resultado.detalhe?.saidaObtida ?? '',
    };
  }
  return resposta;
};











const enviar = async (ator, corpo) => {
  const exercicioId = validarId(corpo.exercicioId);
  const linguagem = validarLinguagem(corpo.linguagem);
  const codigo = validarCodigo(corpo.codigo);

  const exercicio = await exercicioRepositorio.findById(exercicioId);
  if (!exercicio || !exercicio.ativo) throw new ErroApp('Exercício não encontrado.', 404);

  const casos = await casoDeTesteRepositorio.listarPorExercicio(exercicioId);
  if (casos.length === 0) {
    throw new ErroApp('Este exercício ainda não tem casos de teste.', 409);
  }

  // Verifica e reserva SEM nenhum "await" no meio.
  if (usuariosExecutando.has(ator.id)) {
    throw new ErroApp('Aguarde sua submissão anterior terminar.', 429);
  }
  if (execucoesAtivas >= MAX_SIMULTANEAS) {
    throw new ErroApp('O corretor está ocupado. Tente de novo em alguns segundos.', 429);
  }
  usuariosExecutando.add(ator.id);
  execucoesAtivas++;

  try {
    const id = await submissaoRepositorio.criar({ usuarioId: ator.id, exercicioId, linguagem, codigo });
    const resultado = await executar({ linguagem, codigo, casosDeTeste: casos });

    if (resultado.status === STATUS.ERRO_INTERNO) {
      console.error('ERRO_INTERNO na submissão', id, resultado.detalhe); // só no servidor
    }

    await submissaoRepositorio.finalizar(id, {
      status: resultado.status,
      tempoMs: resultado.tempoMs,
      mensagem: resultado.mensagem,
      testeFalhouIndice: resultado.testeFalhouIndice,
    });

    await registrarLog(ator.id, 'submissao_enviada', {
      submissaoId: id, exercicioId, status: resultado.status,
    });

    return montarResposta(id, resultado, casos);
  } finally {
    usuariosExecutando.delete(ator.id);
    execucoesAtivas--;
  }
};






// Só o dono (ou o administrador) enxerga a submissão.
const obter = async (ator, id) => {
  const submissao = await submissaoRepositorio.findById(id);
  if (!submissao || (submissao.usuario_id !== ator.id && ator.perfil !== 'administrador')) {
    throw new ErroApp('Submissão não encontrada.', 404);
  }
  return submissao;
};






const listarDoUsuario = async (ator, query) => {
  const { pagina, limite, offset } = lerPaginacao(query);
  const exercicioId = query.exercicioId === undefined || query.exercicioId === ''
    ? undefined
    : validarId(query.exercicioId);
  const submissoes = await submissaoRepositorio.listarPorUsuario(ator.id, { exercicioId, limite, offset });
  return { submissoes, pagina, limite };
};






module.exports = { enviar, obter, listarDoUsuario };