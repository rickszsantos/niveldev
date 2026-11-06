const AppError = require('../../shared/errors/AppError');

const DIFICULDADES = ['facil', 'medio', 'dificil'];
const MAX_CASOS_POR_EXERCICIO = 50;
const MAX_TEXTO_CASO = 10000; // caracteres de uma entrada ou de uma saída esperada

const validarTitulo = (valor) => {
    const titulo = typeof valor === 'string' ? valor.trim() : '';
    if (titulo.length < 3 || titulo.length > 150) {
        throw new AppError('Informe o título (entre 3 e 150 caracteres).', 400);
    }
    return titulo;
};

const validarEnunciado = (valor) => {
    const enunciado = typeof valor === 'string' ? valor.trim() : '';
    if (enunciado.length < 10 || enunciado.length > 20000) {
        throw new AppError('Informe o enunciado (entre 10 e 20000 caracteres).', 400);
    }
    return enunciado;
};

const validarDificuldade = (valor) => {
    if (!DIFICULDADES.includes(valor)) {
        throw new AppError(`Dificuldade inválida. Use: ${DIFICULDADES.join(', ')}.`, 400);
    }
    return valor;
};

// A entrada pode ser vazia (programa que não lê nada), mas precisa ser texto.
// O texto é guardado exatamente como veio (sem trim): espaços e quebras de linha
// podem importar na correção.
const validarEntrada = (valor) => {
    if (typeof valor !== 'string' || valor.length > MAX_TEXTO_CASO) {
        throw new AppError(`A entrada deve ser um texto de até ${MAX_TEXTO_CASO} caracteres.`, 400);
    }
    return valor;
};

const validarSaidaEsperada = (valor) => {
    if (typeof valor !== 'string' || valor.trim().length === 0 || valor.length > MAX_TEXTO_CASO) {
        throw new AppError(`A saída esperada é obrigatória (texto de até ${MAX_TEXTO_CASO} caracteres).`, 400);
    }
    return valor;
};

const validarOculto = (valor) => {
    if (typeof valor !== 'boolean') {
        throw new AppError('O campo "oculto" deve ser true ou false.', 400);
    }
    return valor;
};

const validarOrdem = (valor) => {
    if (!Number.isInteger(valor) || valor < 1 || valor > 10000) {
        throw new AppError('A ordem deve ser um número inteiro entre 1 e 10000.', 400);
    }
    return valor;
};

module.exports = {
    DIFICULDADES, MAX_CASOS_POR_EXERCICIO,
    validarTitulo, validarEnunciado, validarDificuldade,
    validarEntrada, validarSaidaEsperada, validarOculto, validarOrdem,
};
