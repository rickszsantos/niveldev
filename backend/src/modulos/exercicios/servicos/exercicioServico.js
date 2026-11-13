const ErroApp = require('../../../compartilhado/erros/ErroApp');
const registrarLog = require('../../../compartilhado/registros/registrarLog');
const exercicioRepositorio = require('../repositorios/exercicioRepositorio');
const casoDeTesteRepositorio = require('../repositorios/casoDeTesteRepositorio');
const { lerPaginacao } = require('../../usuarios/validadores');
const v = require('../validadores');

const ehStaff = (ator) => ator.perfil === 'administrador' || ator.perfil === 'professor';

const buscarOuFalhar = async (id) => {
    const exercicio = await exercicioRepositorio.findById(id);
    if (!exercicio) throw new ErroApp('Exercício não encontrado.', 404);
    return exercicio;
};

// ---------- listar ----------

// Aluno vê só exercícios ativos. Professor/admin veem todos e podem filtrar por ativo.
const listar = async (ator, query) => {
    const { pagina, limite, offset } = lerPaginacao(query);
    const busca = typeof query.busca === 'string' ? query.busca.trim().slice(0, 100) : '';
    const dificuldade = query.dificuldade === undefined || query.dificuldade === ''
        ? undefined
        : v.validarDificuldade(query.dificuldade);

    let ativo;
    if (!ehStaff(ator)) {
        ativo = true;
    } else if (query.ativo !== undefined && query.ativo !== '') {
        if (query.ativo !== 'true' && query.ativo !== 'false') {
            throw new ErroApp('O filtro "ativo" deve ser true ou false.', 400);
        }
        ativo = query.ativo === 'true';
    }

    const { exercises, total } = await exercicioRepositorio.listar({ busca, dificuldade, ativo, limite, offset });

    // A quantidade de casos de teste é informação interna: aluno não recebe.
    if (!ehStaff(ator)) exercises.forEach((e) => { delete e.total_casos; });

    return { exercises, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

// ---------- ver um exercício ----------

// Aluno: só exercício ativo e só os casos NÃO ocultos (exemplos).
// Professor/admin: tudo, incluindo casos ocultos.
const obter = async (ator, id) => {
    const exercicio = await exercicioRepositorio.findById(id);
    if (!exercicio || (!exercicio.ativo && !ehStaff(ator))) {
        throw new ErroApp('Exercício não encontrado.', 404);
    }

    const casos = await casoDeTesteRepositorio.listarPorExercicio(id);
    const casosVisiveis = ehStaff(ator)
        ? casos
        : casos
            .filter((c) => !c.oculto)
            .map((c) => ({ ordem: c.ordem, entrada: c.entrada, saida_esperada: c.saida_esperada }));

    return { ...exercicio, casos_de_teste: casosVisiveis };
};

// ---------- criar / editar / desativar / reativar (professor e admin) ----------

const criar = async (ator, corpo) => {
    const titulo = v.validarTitulo(corpo.titulo);
    const enunciado = v.validarEnunciado(corpo.enunciado);
    const dificuldade = v.validarDificuldade(corpo.dificuldade);

    const exercicio = await exercicioRepositorio.create({ titulo, enunciado, dificuldade, criadoPor: ator.id });
    await registrarLog(ator.id, 'exercicio_criado', { alvoId: exercicio.id, titulo, dificuldade });
    return exercicio;
};

const editar = async (ator, id, corpo) => {
    const dados = {};
    if (corpo.titulo !== undefined) dados.titulo = v.validarTitulo(corpo.titulo);
    if (corpo.enunciado !== undefined) dados.enunciado = v.validarEnunciado(corpo.enunciado);
    if (corpo.dificuldade !== undefined) dados.dificuldade = v.validarDificuldade(corpo.dificuldade);
    if (Object.keys(dados).length === 0) {
        throw new ErroApp('Informe título, enunciado e/ou dificuldade para atualizar.', 400);
    }

    await buscarOuFalhar(id);
    const exercicio = await exercicioRepositorio.atualizar(id, dados);

    // O log guarda quais campos mudaram (não o texto do enunciado, que pode ser longo).
    await registrarLog(ator.id, 'exercicio_editado', { alvoId: id, campos: Object.keys(dados) });
    return exercicio;
};

const definirAtivo = async (ator, id, ativo) => {
    const antes = await buscarOuFalhar(id);
    if (antes.ativo === ativo) return antes; // já estava assim: nada a fazer

    const exercicio = await exercicioRepositorio.atualizarAtivo(id, ativo);
    await registrarLog(ator.id, ativo ? 'exercicio_reativado' : 'exercicio_desativado', { alvoId: id });
    return exercicio;
};

const desativar = (ator, id) => definirAtivo(ator, id, false);
const reativar = (ator, id) => definirAtivo(ator, id, true);

module.exports = { listar, obter, criar, editar, desativar, reativar };
