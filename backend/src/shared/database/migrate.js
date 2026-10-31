const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Espera o banco ficar disponível (útil no Docker, onde o app pode
// subir alguns segundos antes do Postgres terminar de inicializar).
async function waitForDatabase(tentativas = 15, intervaloMs = 2000) {
    for (let i = 1; i <= tentativas; i++) {
        try {
            await pool.query('SELECT 1');
            return;
        } catch (error) {
            console.log(`Aguardando o banco de dados (${i}/${tentativas})... ${error.code || error.message}`);
            if (i === tentativas) throw error;
            await sleep(intervaloMs);
        }
    }
}

// Cria as tabelas caso ainda não existam.
async function migrate() {
    await waitForDatabase();
    const sql = fs.readFileSync(path.join(__dirname, '../../../database/schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Banco de dados pronto.');
}

module.exports = { migrate };
