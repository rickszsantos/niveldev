const pool = require('../../../shared/database/pool');

// Fuso usado nos filtros de data: "de=2026-11-04" significa 00:00 DESTE fuso (e não UTC).
// Pode ser trocado pela variável de ambiente APP_TZ.
const FUSO = process.env.APP_TZ || 'America/Sao_Paulo';

// Lista logs (mais recentes primeiro) com filtros e paginação.
// usuario_nome/usuario_email vêm de um LEFT JOIN: ficam null se o usuário não existe
// (ex.: tentativa de login com e-mail desconhecido).
const listar = async ({ usuarioId, acao, de, ate, limite, offset }) => {
    const condicoes = [];
    const valores = [];
    if (usuarioId !== undefined) {
        valores.push(usuarioId);
        condicoes.push(`l.usuario_id = $${valores.length}`);
    }
    if (acao) {
        valores.push(acao);
        condicoes.push(`l.acao = $${valores.length}`);
    }
    if (de) {
        valores.push(de, FUSO);
        condicoes.push(`l.criado_em >= ($${valores.length - 1}::date::timestamp AT TIME ZONE $${valores.length})`);
    }
    if (ate) {
        valores.push(ate, FUSO);
        // até o fim do dia "ate" (meia-noite do dia seguinte, no fuso configurado)
        condicoes.push(`l.criado_em < (($${valores.length - 1}::date + 1)::timestamp AT TIME ZONE $${valores.length})`);
    }
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const { rows: contagem } = await pool.query(
        `SELECT COUNT(*)::int AS total FROM logs l ${where}`,
        valores
    );
    const { rows } = await pool.query(
        `SELECT l.id, l.usuario_id, u.nome AS usuario_nome, u.email AS usuario_email,
                l.acao, l.detalhes, l.criado_em
           FROM logs l
           LEFT JOIN users u ON u.id = l.usuario_id
           ${where}
          ORDER BY l.criado_em DESC, l.id DESC
          LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`,
        [...valores, limite, offset]
    );
    return { logs: rows, total: contagem[0].total };
};

// Ações já registradas (para montar o filtro da tela).
const listarAcoes = async () => {
    const { rows } = await pool.query('SELECT DISTINCT acao FROM logs ORDER BY acao');
    return rows.map((r) => r.acao);
};

module.exports = { listar, listarAcoes };
