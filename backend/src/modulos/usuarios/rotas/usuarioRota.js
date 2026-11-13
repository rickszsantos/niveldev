const express = require('express');
const usuarioControlador = require('../controladores/usuarioControlador');
const autenticar = require('../../../compartilhado/intermediarios/autenticar');
const autorizar = require('../../../compartilhado/intermediarios/autorizar');

const router = express.Router();

// Todas as rotas exigem login.
router.use(autenticar);

// Só administrador
router.get('/', autorizar('administrador'), usuarioControlador.listar);
router.post('/', autorizar('administrador'), usuarioControlador.criar);
router.patch('/:id/perfil', autorizar('administrador'), usuarioControlador.trocarPerfil);
router.patch('/:id/reativar', autorizar('administrador'), usuarioControlador.reativar);
router.delete('/:id', autorizar('administrador'), usuarioControlador.desativar); // "deletar" = desativar (ativo=false)

// Administrador (qualquer usuário) ou o próprio usuário (a regra fica no service)
router.get('/:id', usuarioControlador.obter);
router.patch('/:id', usuarioControlador.editar);

module.exports = router;
