const AppError = require('../errors/AppError');

// Último middleware da cadeia: transforma qualquer erro em resposta JSON.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message });
    }

    // JSON malformado no corpo da requisição
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido.' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Requisição grande demais.' });
    }

    // Qualquer outra coisa é bug ou falha de infraestrutura: loga aqui,
    // mas não vaza detalhes internos para o cliente.
    console.error('Erro não tratado:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = errorHandler;
