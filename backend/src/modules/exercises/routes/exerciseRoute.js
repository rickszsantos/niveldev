const express = require('express');
const exerciseController = require('../controllers/exerciseController');
const minddware = require('../../../shared/minddware/minddware');
const autorizar = require('../../../shared/minddware/autorizar');

const router = express.Router();
const staff = autorizar('administrador', 'professor');

// Todas as rotas exigem login.
router.use(minddware);

// Qualquer usuário logado (o service filtra o que o aluno pode ver)
router.get('/', exerciseController.listar);
router.get('/:id', exerciseController.obter);

// Só professor e administrador
router.post('/', staff, exerciseController.criar);
router.patch('/:id', staff, exerciseController.editar);
router.delete('/:id', staff, exerciseController.desativar); // "deletar" = desativar (ativo=false)
router.patch('/:id/reativar', staff, exerciseController.reativar);

// Casos de teste (só professor e administrador; o aluno os vê dentro de GET /:id)
router.get('/:id/test-cases', staff, exerciseController.listarCasos);
router.post('/:id/test-cases', staff, exerciseController.criarCaso);
router.patch('/:id/test-cases/:casoId', staff, exerciseController.editarCaso);
router.delete('/:id/test-cases/:casoId', staff, exerciseController.removerCaso);

module.exports = router;
