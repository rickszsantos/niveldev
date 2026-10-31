const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const minddware = require('../../../shared/minddware/minddware');
const router = express.Router();

// Limita tentativas por IP para dificultar força bruta e criação em massa de contas.
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true, // só conta as tentativas que falharam
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

const limiteCadastro = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Muitos cadastros a partir deste endereço. Tente novamente mais tarde.' },
});

router.post('/register', limiteCadastro, authController.register);
router.post('/login', limiteLogin, authController.login);

// Rotas protegidas (exigem "Authorization: Bearer <token>")
router.get('/me', minddware, authController.me);

router.get('/home', minddware, (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à página inicial!' });
});

module.exports = router;
