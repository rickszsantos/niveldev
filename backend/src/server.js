require('dotenv').config({ quiet: true }); // precisa vir antes de qualquer require que leia process.env

const app = require('./app');
const pool = require('./shared/database/pool');
const { migrate } = require('./shared/database/migrate');

const PORT = process.env.PORT || 5050;

// Falha rápido, com mensagem clara, se faltar alguma configuração.
const obrigatorias = ['JWT_SECRET', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const faltando = obrigatorias.filter((nome) => !process.env[nome]);
if (faltando.length > 0) {
    console.error(`Variáveis de ambiente ausentes: ${faltando.join(', ')}. Veja o arquivo .env.example.`);
    process.exit(1);
}

async function start() {
    await migrate();

    const server = app.listen(PORT, () => {
        console.log(`Server rodando na porta ${PORT}`);
    });

    // Encerramento limpo (docker stop envia SIGTERM): termina as requisições em andamento
    // e fecha as conexões com o banco.
    const encerrar = (sinal) => {
        console.log(`${sinal} recebido, encerrando...`);
        server.close(async () => {
            await pool.end();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => encerrar('SIGTERM'));
    process.on('SIGINT', () => encerrar('SIGINT'));
}

start().catch((error) => {
    console.error('Falha ao iniciar o servidor:', error.message);
    process.exit(1);
});
