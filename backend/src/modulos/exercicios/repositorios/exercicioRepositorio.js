const pool = require('../../../compartilhado/banco-de-dados/conexao');

// Tabela "exercises". Único lugar com SQL de exercícios.
const CAMPOS = 'id, titulo, enunciado, dificuldade, ativo, criado_por, criado_em, atualizado_em';

const findById = async (id) => {
    const { rows } = await pool.query(`SELECT ${CAMPOS} FROM exercises WHERE id = $1`, [id]);
    return rows[0] || null;
};

const create = async ({ titulo, enunciado, dificuldade, criadoPor }) => {
    const { rows } = await pool.query(
        `INSERT INTO exercises (titulo, enunciado, dificuldade, criado_por)
         VALUES ($1, $2, $3, $4)
         RETURNING ${CAMPOS}`,
        [titulo, enunciado, dificuldade, criadoPor]
    );
    return rows[0];
};

// Edita só os campos informados.
const atualizar = async (id, { titulo, enunciado, dificuldade }) => {
    const sets = ['atualizado_em = NOW()'];
    const valores = [];
    if (titulo !== undefined) { valores.push(titulo); sets.push(`titulo = $${valores.length}`); }
    if (enunciado !== undefined) { valores.push(enunciado); sets.push(`enunciado = $${valores.length}`); }
    if (dificuldade !== undefined) { valores.push(dificuldade); sets.push(`dificuldade = $${valores.length}`); }
    valores.push(id);
    const { rows } = await pool.query(
        `UPDATE exercises SET ${sets.join(', ')} WHERE id = $${valores.length} RETURNING ${CAMPOS}`,
        valores
    );
    return rows[0] || null;
};

const atualizarAtivo = async (id, ativo) => {
    const { rows } = await pool.query(
        `UPDATE exercises SET ativo = $1, atualizado_em = NOW() WHERE id = $2 RETURNING ${CAMPOS}`,
        [ativo, id]
    );
    return rows[0] || null;
};

// Escapa % _ \ para a busca tratar o texto digitado como texto literal.
const escaparLike = (texto) => texto.replace(/[\\%_]/g, '\\$&');

// Lista para a tela (sem o enunciado completo, que pode ser longo).
// busca: procura no título e no enunciado. total_casos só interessa a professor/admin.
const listar = async ({ busca, dificuldade, ativo, limite, offset }) => {
    const condicoes = [];
    const valores = [];
    if (busca) {
        valores.push(`%${escaparLike(busca)}%`);
        condicoes.push(`(e.titulo ILIKE $${valores.length} OR e.enunciado ILIKE $${valores.length})`);
    }
    if (dificuldade) {
        valores.push(dificuldade);
        condicoes.push(`e.dificuldade = $${valores.length}`);
    }
    if (ativo !== undefined) {
        valores.push(ativo);
        condicoes.push(`e.ativo = $${valores.length}`);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const { rows: contagem } = await pool.query(
        `SELECT COUNT(*)::int AS total FROM exercises e ${where}`,
        valores
    );
    const { rows } = await pool.query(
        `SELECT e.id, e.titulo, e.dificuldade, e.ativo, e.criado_em,
                (SELECT COUNT(*)::int FROM test_cases t WHERE t.exercicio_id = e.id) AS total_casos
           FROM exercises e
           ${where}
          ORDER BY e.dificuldade ASC,
                   e.titulo ASC, e.id ASC
          LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`,
        [...valores, limite, offset]
    );
    return { exercises: rows, total: contagem[0].total };
};

module.exports = { findById, create, atualizar, atualizarAtivo, listar };
