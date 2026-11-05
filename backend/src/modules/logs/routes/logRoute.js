const express = require('express');
const logController = require('../controllers/logController');
const minddware = require('../../../shared/minddware/minddware');
const autorizar = require('../../../shared/minddware/autorizar');

const router = express.Router();

// Logs só para administrador.
router.use(minddware, autorizar('administrador'));

router.get('/', logController.listar);
router.get('/acoes', logController.acoes);

module.exports = router;
