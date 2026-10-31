const { Pool } = require('pg');

// Um único pool de conexões compartilhado por toda a aplicação.
// Lê DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME do ambiente.
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Evita derrubar o processo se uma conexão ociosa cair.
pool.on('error', (err) => {
    console.error('Erro inesperado no pool do banco:', err.message);
});

module.exports = pool;
