// Erro "esperado" da aplicação, com o status HTTP que deve ser devolvido.
// Ex.: throw new AppError('E-mail já cadastrado.', 409);
class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

module.exports = AppError;
