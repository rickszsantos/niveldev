const express = require('express');
const userController = require('../controllers/userController');
const minddware = require('../../../shared/minddware/minddware');
const autorizar = require('../../../shared/minddware/autorizar');

const router = express.Router();

// Todas as rotas exigem login.
router.use(minddware);

// Só administrador
router.get('/', autorizar('administrador'), userController.listar);
router.post('/', autorizar('administrador'), userController.criar);
router.patch('/:id/perfil', autorizar('administrador'), userController.trocarPerfil);
router.patch('/:id/reativar', autorizar('administrador'), userController.reativar);
router.delete('/:id', autorizar('administrador'), userController.desativar); // "deletar" = desativar (ativo=false)

// Administrador (qualquer usuário) ou o próprio usuário (a regra fica no service)
router.get('/:id', userController.obter);
router.patch('/:id', userController.editar);

module.exports = router;
