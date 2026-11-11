const { spawn } = require('child_process');
const path = require('path');

const IMAGEM = 'niveldev-python';
const MAX_SAIDA_BYTES = 64 * 1024;




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
    '-v', `${path.resolve(pastaExecucao, 'main.py')}:/codigo/main.py:ro`,
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

        const timer = setTimeout(() => {
            estourouTempo = true;
            spawn('docker', ['rm', '-f', nome]); // mata o CONTAINER, não só o cliente docker
        }, limiteTempoMs);

        proc.stdout.setEncoding('utf8');
        proc.stderr.setEncoding('utf8');
        proc.stdout.on('data', (pedaco) => {
            // TODO: somar em `saida`; se passar de MAX_SAIDA_BYTES,
            //       marcar estourouSaida e remover o container
        });
        proc.stderr.on('data', (pedaco) => {
            // TODO: o mesmo para `erro`
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