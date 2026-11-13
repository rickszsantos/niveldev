// Erro "esperado" da aplicação, com o status HTTP que deve ser devolvido.
// Ex.: throw new ErroApp('E-mail já cadastrado.', 409);
class ErroApp extends Error {
    constructor(message, status = 400) {
        super(message);
        this.name = 'ErroApp';
        this.status = status;
    }
}

module.exports = ErroApp;
