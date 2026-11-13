const autenticacaoServico = require('../servicos/autenticacaoServico');

// Erros (ErroApp, falhas do banco etc.) são tratados no tratadorDeErros central;
// no Express 5, exceções em handlers async já são repassadas automaticamente.

const register = async (req, res) => {
    const { nome, email, password } = req.body;
    const resultado = await autenticacaoServico.register({ nome, email, password }, { ip: req.ip });
    res.status(201).json(resultado);
};





const login = async (req, res) => {
    const { email, password } = req.body;
    const resultado = await autenticacaoServico.login(email, password, { ip: req.ip });
    res.status(200).json(resultado);
};





const me = async (req, res) => {
    const user = await autenticacaoServico.getProfile(req.user.id);
    res.status(200).json({ user });
};



module.exports = { register, login, me };
