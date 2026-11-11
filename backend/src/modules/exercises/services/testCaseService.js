const AppError = require('../../../shared/errors/AppError');
const registrarLog = require('../../../shared/logs/registrarLog');
const exerciseRepository = require('../repositories/exerciseRepository');
const testCaseRepository = require('../repositories/testCaseRepository');
const v = require('../validators');

// Todas as funções daqui são só para professor/admin (a rota já garante).

const garantirExercicio = async (exercicioId) => {
    if (!(await exerciseRepository.findById(exercicioId))) {
        throw new AppError('Exercício não encontrado.', 404);
    }
};

const listar = async (exercicioId) => {
    await garantirExercicio(exercicioId);
    return testCaseRepository.listarPorExercicio(exercicioId);
};

const criar = async (ator, exercicioId, corpo) => {
    const entrada = v.validarEntrada(corpo.entrada === undefined ? '' : corpo.entrada);
    const saidaEsperada = v.validarSaidaEsperada(corpo.saida_esperada);
    const oculto = corpo.oculto === undefined ? true : v.validarOculto(corpo.oculto);
    const ordem = corpo.ordem === undefined ? undefined : v.validarOrdem(corpo.ordem);

    await garantirExercicio(exercicioId);
    if ((await testCaseRepository.contar(exercicioId)) >= v.MAX_CASOS_POR_EXERCICIO) {
        throw new AppError(`Limite de ${v.MAX_CASOS_POR_EXERCICIO} casos de teste por exercício.`, 409);
    }

    const caso = await testCaseRepository.create({
        exercicioId,
        ordem: ordem ?? (await testCaseRepository.proximaOrdem(exercicioId)),
        entrada,
        saidaEsperada,
        oculto,
    });
    // O log NÃO guarda entrada nem saída (podem ser de caso oculto).
    await registrarLog(ator.id, 'caso_teste_criado', { exercicioId, casoId: caso.id, oculto: caso.oculto });
    return caso;
};

const editar = async (ator, exercicioId, casoId, corpo) => {
    const dados = {};
    if (corpo.entrada !== undefined) dados.entrada = v.validarEntrada(corpo.entrada);
    if (corpo.saida_esperada !== undefined) dados.saidaEsperada = v.validarSaidaEsperada(corpo.saida_esperada);
    if (corpo.oculto !== undefined) dados.oculto = v.validarOculto(corpo.oculto);
    if (corpo.ordem !== undefined) dados.ordem = v.validarOrdem(corpo.ordem);
    if (Object.keys(dados).length === 0) {
        throw new AppError('Informe entrada, saida_esperada, oculto e/ou ordem para atualizar.', 400);
    }

    const caso = await testCaseRepository.atualizar(casoId, exercicioId, dados);
    if (!caso) throw new AppError('Caso de teste não encontrado.', 404);

    await registrarLog(ator.id, 'caso_teste_editado', { exercicioId, casoId, campos: Object.keys(dados) });
    return caso;
};

const remover = async (ator, exercicioId, casoId) => {
    if (!(await testCaseRepository.remover(casoId, exercicioId))) {
        throw new AppError('Caso de teste não encontrado.', 404);
    }
    await registrarLog(ator.id, 'caso_teste_removido', { exercicioId, casoId });
};

module.exports = { listar, criar, editar, remover };
