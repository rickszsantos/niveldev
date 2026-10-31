const jwt = require('jsonwebtoken');

// Middleware de autenticação: valida o token JWT enviado no header
//   Authorization: Bearer <token>
// e coloca o conteúdo dele em req.user (ex.: req.user.id).
function minddware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const [tipo, token] = authHeader.split(' ');
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Token inválido.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        // TokenExpiredError / JsonWebTokenError: o front deve mandar o usuário logar de novo.
        const expirado = error.name === 'TokenExpiredError';
        return res.status(401).json({ error: expirado ? 'Sessão expirada.' : 'Token inválido.' });
    }
}

module.exports = minddware;
