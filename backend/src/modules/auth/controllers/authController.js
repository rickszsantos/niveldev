const authService = require('../services/authService');

// Erros (AppError, falhas do banco etc.) são tratados no errorHandler central;
// no Express 5, exceções em handlers async já são repassadas automaticamente.

const register = async (req, res) => {
    const { nome, email, password } = req.body;
    const resultado = await authService.register({ nome, email, password });
    res.status(201).json(resultado);
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const resultado = await authService.login(email, password);
    res.status(200).json(resultado);
};

const me = async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ user });
};

module.exports = { register, login, me };
