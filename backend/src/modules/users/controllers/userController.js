const userService = require('../services/userService');
const { validarId } = require('../validators');

// req.user = { id, perfil } (preenchido pelo middleware de autenticação).

const listar = async (req, res) => {
    res.status(200).json(await userService.listar(req.query));
};

const obter = async (req, res) => {
    const user = await userService.obter(req.user, validarId(req.params.id));
    res.status(200).json({ user });
};

const criar = async (req, res) => {
    const user = await userService.criar(req.user, req.body);
    res.status(201).json({ user });
};

const editar = async (req, res) => {
    const user = await userService.editar(req.user, validarId(req.params.id), req.body);
    res.status(200).json({ user });
};

const trocarPerfil = async (req, res) => {
    const user = await userService.trocarPerfil(req.user, validarId(req.params.id), req.body.perfil);
    res.status(200).json({ user });
};

const desativar = async (req, res) => {
    const user = await userService.desativar(req.user, validarId(req.params.id));
    res.status(200).json({ user });
};

const reativar = async (req, res) => {
    const user = await userService.reativar(req.user, validarId(req.params.id));
    res.status(200).json({ user });
};

module.exports = { listar, obter, criar, editar, trocarPerfil, desativar, reativar };
