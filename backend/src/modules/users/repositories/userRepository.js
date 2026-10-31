const pool = require('../../../shared/database/pool');

// Campos que podem ser devolvidos ao cliente (nunca inclui senha_hash).
const CAMPOS_PUBLICOS = 'id, nome, email, criado_em';

// Usado no login: precisa do hash para comparar a senha.
const findByEmail = async (email) => {
    const { rows } = await pool.query(
        'SELECT id, nome, email, senha_hash FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    );
    return rows[0] || null;
};

const findById = async (id) => {
    const { rows } = await pool.query(
        `SELECT ${CAMPOS_PUBLICOS} FROM users WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
};

const create = async ({ nome, email, senhaHash }) => {
    const { rows } = await pool.query(
        `INSERT INTO users (nome, email, senha_hash)
         VALUES ($1, $2, $3)
         RETURNING ${CAMPOS_PUBLICOS}`,
        [nome, email, senhaHash]
    );
    return rows[0];
};

module.exports = { findByEmail, findById, create };
