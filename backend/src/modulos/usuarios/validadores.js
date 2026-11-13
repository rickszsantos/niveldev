const ErroApp = require('../../compartilhado/erros/ErroApp');

const PERFIS = ['administrador', 'professor', 'aluno'];
const SENHA_MIN = 8;
const SENHA_MAX_BYTES = 72; // limite do bcrypt
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_MAX = 2147483647; // maior valor de um SERIAL (INTEGER) do Postgres

const validarNome = (valor) => {
    const nome = typeof valor === 'string' ? valor.trim() : '';
    if (nome.length < 2 || nome.length > 120) {
        throw new ErroApp('Informe o nome (entre 2 e 120 caracteres).', 400);
    }
    return nome;
};

const validarEmail = (valor) => {
    const email = typeof valor === 'string' ? valor.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(email) || email.length > 255) {
        throw new ErroApp('Informe um e-mail válido.', 400);
    }
    return email;
};

const validarSenha = (valor) => {
    if (typeof valor !== 'string' || valor.length < SENHA_MIN) {
        throw new ErroApp(`A senha deve ter pelo menos ${SENHA_MIN} caracteres.`, 400);
    }
    if (Buffer.byteLength(valor) > SENHA_MAX_BYTES) {
        throw new ErroApp('A senha é muito longa (máximo de 72 caracteres).', 400);
    }
    return valor;
};

const validarPerfil = (valor) => {
    if (!PERFIS.includes(valor)) {
        throw new ErroApp(`Perfil inválido. Use: ${PERFIS.join(', ')}.`, 400);
    }
    return valor;
};

// Converte o :id da URL em número, ou responde 400.
const validarId = (valor) => {
    const id = Number(valor);
    if (!/^\d+$/.test(String(valor)) || id < 1 || id > ID_MAX) {
        throw new ErroApp('Identificador inválido.', 400);
    }
    return id;
};

// Paginação a partir da query string: ?pagina=2&limite=20 (limite máximo 100).
const lerPaginacao = (query) => {
    const pagina = query.pagina === undefined ? 1 : Number(query.pagina);
    const limite = query.limite === undefined ? 20 : Number(query.limite);
    if (!Number.isInteger(pagina) || pagina < 1) {
        throw new ErroApp('Página inválida.', 400);
    }
    if (!Number.isInteger(limite) || limite < 1 || limite > 100) {
        throw new ErroApp('Limite inválido (use de 1 a 100).', 400);
    }
    return { pagina, limite, offset: (pagina - 1) * limite };
};

module.exports = {
    PERFIS, validarNome, validarEmail, validarSenha, validarPerfil, validarId, lerPaginacao,
};
