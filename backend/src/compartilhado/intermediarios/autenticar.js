const jwt = require('jsonwebtoken');
const usuarioRepositorio = require('../../modulos/usuarios/repositorios/usuarioRepositorio');

// Middleware de autenticação: valida o token JWT enviado no header
//   Authorization: Bearer <token>
// e consulta o banco para saber se o usuário ainda existe e está ativo.
// Resultado em req.user: { id, perfil }.
// (Consultar o banco a cada requisição faz um usuário desativado, ou com perfil
// alterado, perder/mudar o acesso na hora, sem esperar o token de 1h expirar.)
async function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const [tipo, token] = authHeader.split(' ');
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Token inválido.' });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // TokenExpiredError / JsonWebTokenError: o front deve mandar o usuário logar de novo.
        const expirado = error.name === 'TokenExpiredError';
        return res.status(401).json({ error: expirado ? 'Sessão expirada.' : 'Token inválido.' });
    }

    // Erros do banco sobem para o tratadorDeErros (500); no Express 5 isso é automático.
    const user = await usuarioRepositorio.findById(payload.id);
    if (!user || !user.ativo) {
        return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
    }

    req.user = { id: user.id, perfil: user.perfil };
    next();
}

module.exports = autenticar;
