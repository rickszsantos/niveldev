const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { executarTeste } = require('./gerenciadorDeContainer');
const { avaliar } = require('./avaliadorDeResultado');
const { STATUS, criar } = require('./resultadoDaExecucao');

const PASTA_BASE = path.join(__dirname, '../../temp/execucoes');
const LIMITE_TEMPO_MS = 10000;

// Deixa só o final do erro do Python (onde fica o nome do erro) e esconde o caminho interno.
const limparErro = (texto) => texto
    .replace(/\/codigo\/main\.py/g, 'main.py')
    .trim()
    .split('\n')
    .slice(-5)
    .join('\n')
    .slice(-500);

const executar = async ({ linguagem, codigo, casosDeTeste }) => {
    const id = `exec_${crypto.randomBytes(6).toString('hex')}`;
    const pasta = path.join(PASTA_BASE, id);
    try {
        const total = casosDeTeste.length;
        if (total === 0) throw new Error('O exercício não tem casos de teste.');

        await fs.mkdir(pasta, { recursive: true });
        await fs.writeFile(path.join(pasta, 'main.py'), codigo);

        let tempoTotal = 0;
        // Monta o resultado de uma falha no teste de posição i (começando em 0).
        const falhar = (status, i, extra = {}) => criar(status, {
            tempoMs: tempoTotal,
            testesPassados: i,
            totalTestes: total,
            testeFalhouIndice: i + 1,
            ...extra,
        });

        for (let i = 0; i < total; i++) {
            const caso = casosDeTeste[i];
            const r = await executarTeste({
                nome: `niveldev_${id}_${i}`,
                pastaExecucao: pasta,
                entrada: caso.entrada,
                limiteTempoMs: LIMITE_TEMPO_MS,
            });
            tempoTotal += r.tempoMs;

            // A ordem dos "if" importa: um container morto por nós também sai com 137.
            if (r.estourouTempo) return falhar(STATUS.TEMPO_EXCEDIDO, i);
            if (r.estourouSaida) {
                return falhar(STATUS.ERRO_DE_EXECUCAO, i, { mensagem: 'Seu código produziu saída demais.' });
            }
            if (r.codigoSaida === 137) return falhar(STATUS.MEMORIA_EXCEDIDA, i);
            if (r.codigoSaida !== 0) {
                return falhar(STATUS.ERRO_DE_EXECUCAO, i, {
                    mensagem: `Seu código deu erro ao executar.\n${limparErro(r.erro)}`,
                });
            }
            if (!avaliar(r.saida, caso.saida_esperada)) {
                return falhar(STATUS.RESPOSTA_INCORRETA, i, {
                    mensagem: `Resposta incorreta no teste ${i + 1} de ${total}.`,
                    detalhe: { saidaObtida: r.saida }, // só para log e para o serviço decidir o que mostrar
                });
            }
        }
        return criar(STATUS.ACEITO, { tempoMs: tempoTotal, testesPassados: total, totalTestes: total });
    } catch (e) {
        return criar(STATUS.ERRO_INTERNO, { mensagem: 'Erro interno ao corrigir. Tente novamente.', detalhe: e.message });
    } finally {
       await fs.rm(pasta, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
           .catch((e) => console.error('Falha ao limpar', pasta, e.message));
   }
};

module.exports = { executar };