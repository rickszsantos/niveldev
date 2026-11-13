const pool = require('../../../compartilhado/banco-de-dados/conexao');




// Campos que podem ser devolvidos ao cliente (nunca inclui senha_hash).
const CAMPOS_PUBLICOS = 'id, nome, email, perfil, ativo, criado_em';






// Usado no login: precisa do hash para comparar a senha.
const findByEmail = async (email) => {
    const { rows } = await pool.query(
        'SELECT id, nome, email, senha_hash, perfil, ativo FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    );
    return rows[0] || null;
};





// db é opcional: passe o client de uma transação para ler dentro dela.
const findById = async (id, db = pool) => {
    const { rows } = await db.query(
        `SELECT ${CAMPOS_PUBLICOS} FROM users WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
};





const create = async ({ nome, email, senhaHash, perfil = 'aluno' }) => {
    const { rows } = await pool.query(
        `INSERT INTO users (nome, email, senha_hash, perfil)
         VALUES ($1, $2, $3, $4)
         RETURNING ${CAMPOS_PUBLICOS}`,
        [nome, email, senhaHash, perfil]
    );
    return rows[0];
};

const existeAdministrador = async () => {
    const { rows } = await pool.query(
        "SELECT 1 FROM users WHERE perfil = 'administrador' LIMIT 1"
    );
    return rows.length > 0;
};



const atualizarPerfil = async (id, perfil, db = pool) => {
    const { rows } = await db.query(
        `UPDATE users SET perfil = $1 WHERE id = $2 RETURNING ${CAMPOS_PUBLICOS}`,
        [perfil, id]
    );
    return rows[0] || null;
};

const atualizarAtivo = async (id, ativo, db = pool) => {
    const { rows } = await db.query(
        `UPDATE users SET ativo = $1 WHERE id = $2 RETURNING ${CAMPOS_PUBLICOS}`,
        [ativo, id]
    );
    return rows[0] || null;
};

// Edita só os campos informados (nome e/ou email).
const atualizarDados = async (id, { nome, email }) => {
    const sets = [];
    const valores = [];
    if (nome !== undefined) { valores.push(nome); sets.push(`nome = $${valores.length}`); }
    if (email !== undefined) { valores.push(email); sets.push(`email = $${valores.length}`); }
    valores.push(id);
    const { rows } = await pool.query(
        `UPDATE users SET ${sets.join(', ')} WHERE id = $${valores.length} RETURNING ${CAMPOS_PUBLICOS}`,
        valores
    );
    return rows[0] || null;
};

const contarAdminsAtivos = async (db = pool) => {
    const { rows } = await db.query(
        "SELECT COUNT(*)::int AS total FROM users WHERE perfil = 'administrador' AND ativo = TRUE"
    );
    return rows[0].total;
};

// Escapa % _ \ para a busca tratar o texto digitado como texto literal.
const escaparLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');

// Lista com busca (nome ou e-mail), filtros e paginação.
const listar = async ({ busca, perfil, ativo, limite, offset }) => {
    const condicoes = [];
    const valores = [];
    if (busca) {
        valores.push(`%${escaparLike(busca)}%`);
        condicoes.push(`(nome ILIKE $${valores.length} OR email ILIKE $${valores.length})`);
    }
    if (perfil) {
        valores.push(perfil);
        condicoes.push(`perfil = $${valores.length}`);
    }
    if (ativo !== undefined) {
        valores.push(ativo);
        condicoes.push(`ativo = $${valores.length}`);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const { rows: contagem } = await pool.query(
        `SELECT COUNT(*)::int AS total FROM users ${where}`,
        valores
    );
    const { rows } = await pool.query(
        `SELECT ${CAMPOS_PUBLICOS} FROM users ${where}
         ORDER BY nome ASC, id ASC
         LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`,
        [...valores, limite, offset]
    );
    return { users: rows, total: contagem[0].total };
};

// Roda fn(client) dentro de uma transação protegida por um lock global de "administradores".
// Serve para que duas requisições simultâneas não desativem/rebaixem os dois últimos admins.
const comTravaAdmin = async (fn) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(7001)');
        const resultado = await fn(client);
        await client.query('COMMIT');
        return resultado;
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    findByEmail, findById, create, existeAdministrador,
    atualizarPerfil, atualizarAtivo, atualizarDados,
    contarAdminsAtivos, listar, comTravaAdmin,
};
