const pool = require('../../../shared/database/pool');

// Tabela "test_cases". Único lugar com SQL de casos de teste.
const CAMPOS = 'id, exercicio_id, ordem, entrada, saida_esperada, oculto, criado_em';

const listarPorExercicio = async (exercicioId) => {
    const { rows } = await pool.query(
        `SELECT ${CAMPOS} FROM test_cases WHERE exercicio_id = $1 ORDER BY ordem ASC, id ASC`,
        [exercicioId]
    );
    return rows;
};

const contar = async (exercicioId) => {
    const { rows } = await pool.query(
        'SELECT COUNT(*)::int AS total FROM test_cases WHERE exercicio_id = $1',
        [exercicioId]
    );
    return rows[0].total;
};

const proximaOrdem = async (exercicioId) => {
    const { rows } = await pool.query(
        'SELECT COALESCE(MAX(ordem), 0) + 1 AS ordem FROM test_cases WHERE exercicio_id = $1',
        [exercicioId]
    );
    return rows[0].ordem;
};

const create = async ({ exercicioId, ordem, entrada, saidaEsperada, oculto }) => {
    const { rows } = await pool.query(
        `INSERT INTO test_cases (exercicio_id, ordem, entrada, saida_esperada, oculto)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${CAMPOS}`,
        [exercicioId, ordem, entrada, saidaEsperada, oculto]
    );
    return rows[0];
};

// Edita só os campos informados. O "AND exercicio_id" garante que o caso pertence
// ao exercício da URL (não dá para editar o caso de outro exercício trocando o id).
const atualizar = async (id, exercicioId, { ordem, entrada, saidaEsperada, oculto }) => {
    const sets = [];
    const valores = [];
    if (ordem !== undefined) { valores.push(ordem); sets.push(`ordem = $${valores.length}`); }
    if (entrada !== undefined) { valores.push(entrada); sets.push(`entrada = $${valores.length}`); }
    if (saidaEsperada !== undefined) { valores.push(saidaEsperada); sets.push(`saida_esperada = $${valores.length}`); }
    if (oculto !== undefined) { valores.push(oculto); sets.push(`oculto = $${valores.length}`); }
    valores.push(id, exercicioId);
    const { rows } = await pool.query(
        `UPDATE test_cases SET ${sets.join(', ')}
          WHERE id = $${valores.length - 1} AND exercicio_id = $${valores.length}
          RETURNING ${CAMPOS}`,
        valores
    );
    return rows[0] || null;
};

const remover = async (id, exercicioId) => {
    const { rowCount } = await pool.query(
        'DELETE FROM test_cases WHERE id = $1 AND exercicio_id = $2',
        [id, exercicioId]
    );
    return rowCount > 0;
};

module.exports = { listarPorExercicio, contar, proximaOrdem, create, atualizar, remover };
