// Middleware de autorização (nível de acesso). Usado DEPOIS do minddware:
//   router.get('/users', minddware, autorizar('administrador'), controller.listar)
//   router.get('/x', minddware, autorizar('administrador', 'professor'), ...)
// Depende de req.user.perfil, que o minddware carrega do banco.
function autorizar(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.user || !perfisPermitidos.includes(req.user.perfil)) {
            return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
        }
        next();
    };
}

module.exports = autorizar;
