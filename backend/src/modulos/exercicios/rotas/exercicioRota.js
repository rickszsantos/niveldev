const express = require('express');
const exercicioControlador = require('../controladores/exercicioControlador');
const autenticar = require('../../../compartilhado/intermediarios/autenticar');
const autorizar = require('../../../compartilhado/intermediarios/autorizar');

const router = express.Router();
const staff = autorizar('administrador', 'professor');

// Todas as rotas exigem login.
router.use(autenticar);

// Qualquer usuário logado (o service filtra o que o aluno pode ver)
router.get('/', exercicioControlador.listar);
router.get('/:id', exercicioControlador.obter);

// Só professor e administrador
router.post('/', staff, exercicioControlador.criar);
router.patch('/:id', staff, exercicioControlador.editar);
router.delete('/:id', staff, exercicioControlador.desativar); // "deletar" = desativar (ativo=false)
router.patch('/:id/reativar', staff, exercicioControlador.reativar);

// Casos de teste (só professor e administrador; o aluno os vê dentro de GET /:id)
router.get('/:id/test-cases', staff, exercicioControlador.listarCasos);
router.post('/:id/test-cases', staff, exercicioControlador.criarCaso);
router.patch('/:id/test-cases/:casoId', staff, exercicioControlador.editarCaso);
router.delete('/:id/test-cases/:casoId', staff, exercicioControlador.removerCaso);

module.exports = router;
