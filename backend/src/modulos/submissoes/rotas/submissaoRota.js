const { Router } = require('express');
const autenticar = require('../../../compartilhado/intermediarios/autenticar');
const submissaoControlador = require('../controladores/submissaoControlador');





const router = Router();






// Todas exigem login. Não precisa ser administrador.
router.post('/', autenticar, submissaoControlador.enviar);
router.get('/', autenticar, submissaoControlador.listar);
router.get('/:id', autenticar, submissaoControlador.obter);

module.exports = router;