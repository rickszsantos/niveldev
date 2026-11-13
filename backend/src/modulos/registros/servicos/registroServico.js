const ErroApp = require('../../../compartilhado/erros/ErroApp');
const registroRepositorio = require('../repositorios/registroRepositorio');
const { validarId, lerPaginacao } = require('../../usuarios/validadores');

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const lerData = (valor, nome) => {
    if (valor === undefined || valor === '') return undefined;
    // Confere formato E se a data existe (rejeita 2026-02-31).
    if (typeof valor !== 'string' || !DATA_REGEX.test(valor)
        || new Date(`${valor}T00:00:00Z`).toISOString().slice(0, 10) !== valor) {
        throw new ErroApp(`Data "${nome}" inválida. Use AAAA-MM-DD.`, 400);
    }
    return valor;
};

// Filtros (query string): usuarioId, acao, de, ate (AAAA-MM-DD), pagina, limite.
const listar = async (query) => {
    const { pagina, limite, offset } = lerPaginacao(query);
    const usuarioId = query.usuarioId === undefined || query.usuarioId === ''
        ? undefined
        : validarId(query.usuarioId);
    const acao = typeof query.acao === 'string' ? query.acao.trim().slice(0, 80) : '';
    const de = lerData(query.de, 'de');
    const ate = lerData(query.ate, 'ate');

    const { logs, total } = await registroRepositorio.listar({ usuarioId, acao, de, ate, limite, offset });
    return { logs, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

const listarAcoes = () => registroRepositorio.listarAcoes();

module.exports = { listar, listarAcoes };
