const { spawn } = require('child_process');
const path = require('path');

const IMAGEM = 'niveldev-python';
const MAX_SAIDA_BYTES = 64 * 1024;
const PASTA_EXECUCOES_HOST = process.env.PASTA_EXECUCOES_HOST;

if (!PASTA_EXECUCOES_HOST) {
    throw new Error('A variável PASTA_EXECUCOES_HOST não foi configurada.');
}


const montarArgumentos = (nome, pastaExecucao) => [
    'run', '--rm', '-i',
    '--name', nome,
    '--network', 'none',
    '--memory', '128m', '--memory-swap', '128m',
    '--cpus', '0.5',
    '--pids-limit', '64',
    '--read-only',
    '--cap-drop', 'ALL',
    '--security-opt', 'no-new-privileges',
    '--user', '1000:1000',
    '-v', `${path.join(PASTA_EXECUCOES_HOST, path.basename(pastaExecucao), 'main.py')}:/codigo/main.py:ro`,
    IMAGEM,
];



const executarTeste = ({ nome, pastaExecucao, entrada, limiteTempoMs }) =>
    new Promise((resolve, reject) => {
        const inicio = Date.now();
        const proc = spawn('docker', montarArgumentos(nome, pastaExecucao));
        let saida = '';
        let erro = '';
        let estourouTempo = false;
        let estourouSaida = false;

        const matarContainer = () => spawn('docker', ['rm', '-f', nome]); // mata o CONTAINER, não só o cliente docker

        const timer = setTimeout(() => {
            estourouTempo = true;
            matarContainer();
        }, limiteTempoMs);

        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');

        proc.stdout.on('data', (pedaco) => {
            if (estourouSaida) return;            // já passou do limite: ignora o resto
            saida += pedaco;
            if (saida.length > MAX_SAIDA_BYTES) {
                estourouSaida = true;
                saida = saida.slice(0, MAX_SAIDA_BYTES);
                matarContainer();
            }
        });
        proc.stderr.on('data', (pedaco) => {
            if (estourouSaida) return;
            erro += pedaco;
            if (erro.length > MAX_SAIDA_BYTES) {
                estourouSaida = true;
                erro = erro.slice(0, MAX_SAIDA_BYTES);
                matarContainer();
            }
        });

        proc.on('error', (e) => { clearTimeout(timer); reject(e); }); // docker não instalado ou fora do ar
        proc.on('close', (codigoSaida) => {
            clearTimeout(timer);
            resolve({ saida, erro, codigoSaida, tempoMs: Date.now() - inicio, estourouTempo, estourouSaida });
        });

        proc.stdin.on('error', () => {}); // o programa pode fechar o stdin antes de ler tudo
        proc.stdin.end(entrada);
    });

module.exports = { executarTeste };