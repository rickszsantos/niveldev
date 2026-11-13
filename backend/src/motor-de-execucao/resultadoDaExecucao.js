const STATUS = Object.freeze({
    ACEITO: 'ACEITO',
    RESPOSTA_INCORRETA: 'RESPOSTA_INCORRETA',
    TEMPO_EXCEDIDO: 'TEMPO_EXCEDIDO',
    ERRO_DE_EXECUCAO: 'ERRO_DE_EXECUCAO',
    MEMORIA_EXCEDIDA: 'MEMORIA_EXCEDIDA',
    ERRO_INTERNO: 'ERRO_INTERNO',
});





// Mensagem padrão de cada status (o que o aluno lê quando nada mais específico é informado)
const MENSAGENS = Object.freeze({
    [STATUS.ACEITO]: 'Todos os testes passaram.',
    [STATUS.RESPOSTA_INCORRETA]: 'Resposta incorreta.',
    [STATUS.TEMPO_EXCEDIDO]: 'Seu código demorou mais que o permitido.',
    [STATUS.ERRO_DE_EXECUCAO]: 'Seu código deu erro ao executar.',
    [STATUS.MEMORIA_EXCEDIDA]: 'Seu código usou mais memória que o permitido.',
    [STATUS.ERRO_INTERNO]: 'Tivemos um problema aqui. Tente novamente em instantes.',
});





const criar = (status, dados = {}) => {
    if (!Object.values(STATUS).includes(status)) {
        throw new Error(`Status inválido: ${status}`);
    }
    return {
        status,
        tempoMs: dados.tempoMs ?? null,
        testesPassados: dados.testesPassados ?? 0,
        totalTestes: dados.totalTestes ?? 0,
        testeFalhouIndice: dados.testeFalhouIndice ?? null,
        mensagem: dados.mensagem ?? MENSAGENS[status],
        detalhe: dados.detalhe ?? null, // só para log interno, nunca vai ao aluno
    };
};



module.exports = { STATUS, criar };

