const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { executarTeste } = require('./containerManager');
const { avaliar } = require('./resultEvaluator');
const { STATUS, criar } = require('./executionResult');

const PASTA_BASE = path.join(__dirname, '../../temp/executions');
const LIMITE_TEMPO_MS = 3000;

const executar = async ({ linguagem, codigo, casosDeTeste }) => {
    const id = `exec_${crypto.randomBytes(6).toString('hex')}`;
    const pasta = path.join(PASTA_BASE, id);
    try {
        await fs.mkdir(pasta, { recursive: true });
        await fs.writeFile(path.join(pasta, 'main.py'), codigo);

        let tempoTotal = 0;
        for (let i = 0; i < casosDeTeste.length; i++) {
            const caso = casosDeTeste[i];
            const r = await executarTeste({
                nome: `niveldev_${id}_${i}`,
                pastaExecucao: pasta,
                entrada: caso.entrada,
                limiteTempoMs: LIMITE_TEMPO_MS,
            });
            tempoTotal += r.tempoMs;
            // TODO: se r.estourouTempo         -> devolver TIME_LIMIT_EXCEEDED
            // TODO: se r.codigoSaida === 137   -> devolver MEMORY_LIMIT_EXCEEDED
            // TODO: se r.estourouSaida ou r.codigoSaida !== 0 -> devolver RUNTIME_ERROR
            // TODO: se !avaliar(r.saida, caso.saida_esperada) -> devolver WRONG_ANSWER
        }
        return criar(STATUS.ACCEPTED, { tempoMs: tempoTotal, testesPassados: casosDeTeste.length, totalTestes: casosDeTeste.length });
    } catch (e) {
        return criar(STATUS.INTERNAL_ERROR, { mensagem: 'Erro interno ao corrigir. Tente novamente.', detalhe: e.message });
    } finally {
        await fs.rm(pasta, { recursive: true, force: true });
    }
};

module.exports = { executar };