const pool = require('../database/pool');

// Grava uma linha na tabela logs.
//   registrarLog(usuarioId, 'login_sucesso', { ip: '1.2.3.4' })
// usuarioId pode ser null (ex.: tentativa de login com e-mail inexistente).
// Nunca lança erro: uma falha ao gravar o log não pode derrubar a requisição.
const registrarLog = async (usuarioId, acao, detalhes = null) => {
    try {
        await pool.query(
            'INSERT INTO logs (usuario_id, acao, detalhes) VALUES ($1, $2, $3)',
            [usuarioId ?? null, acao, detalhes ? JSON.stringify(detalhes) : null]
        );
    } catch (error) {
        console.error('Falha ao registrar log:', error.message);
    }
};

module.exports = registrarLog;
