const express = require('express');
const registroControlador = require('../controladores/registroControlador');
const autenticar = require('../../../compartilhado/intermediarios/autenticar');
const autorizar = require('../../../compartilhado/intermediarios/autorizar');

const router = express.Router();

// Logs só para administrador.
router.use(autenticar, autorizar('administrador'));

router.get('/', registroControlador.listar);
router.get('/acoes', registroControlador.acoes);

module.exports = router;
