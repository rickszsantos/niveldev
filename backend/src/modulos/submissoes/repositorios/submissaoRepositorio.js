const pool = require('../../../compartilhado/banco-de-dados/conexao');
// Sem o "codigo": a lista não precisa carregar o código de cada tentativa.
const CAMPOS = 'id, usuario_id, exercicio_id, linguagem, status, tempo_ms, mensagem, teste_falhou_indice, criado_em';







const criar = async ({ usuarioId, exercicioId, linguagem, codigo }) => {
  const { rows } = await pool.query(
    `INSERT INTO submissions (usuario_id, exercicio_id, linguagem, codigo)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [usuarioId, exercicioId, linguagem, codigo]
  );
  return rows[0].id;
};








const finalizar = async (id, { status, tempoMs, mensagem, testeFalhouIndice }) => {
  await pool.query(
    `UPDATE submissions
     SET status = $2, tempo_ms = $3, mensagem = $4, teste_falhou_indice = $5
     WHERE id = $1`,
    [id, status, tempoMs, mensagem, testeFalhouIndice]
  );
};






const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS}, codigo FROM submissions WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};








const listarPorUsuario = async (usuarioId, { exercicioId, limite, offset }) => {
  const valores = [usuarioId];
  let filtro = '';
  if (exercicioId) {
    valores.push(exercicioId);
    filtro = ` AND exercicio_id = $${valores.length}`;
  }
  valores.push(limite, offset);
  const { rows } = await pool.query(
    `SELECT ${CAMPOS} FROM submissions
     WHERE usuario_id = $1${filtro}
     ORDER BY criado_em DESC
     LIMIT $${valores.length - 1} OFFSET $${valores.length}`,
    valores
  );
  return rows;
};




module.exports = { criar, finalizar, findById, listarPorUsuario };