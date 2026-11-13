const usuarioServico = require('../servicos/usuarioServico');
const { validarId } = require('../validadores');

// req.user = { id, perfil } (preenchido pelo middleware de autenticação).

const listar = async (req, res) => {
    res.status(200).json(await usuarioServico.listar(req.query));
};

const obter = async (req, res) => {
    const user = await usuarioServico.obter(req.user, validarId(req.params.id));
    res.status(200).json({ user });
};

const criar = async (req, res) => {
    const user = await usuarioServico.criar(req.user, req.body);
    res.status(201).json({ user });
};

const editar = async (req, res) => {
    const user = await usuarioServico.editar(req.user, validarId(req.params.id), req.body);
    res.status(200).json({ user });
};

const trocarPerfil = async (req, res) => {
    const user = await usuarioServico.trocarPerfil(req.user, validarId(req.params.id), req.body.perfil);
    res.status(200).json({ user });
};

const desativar = async (req, res) => {
    const user = await usuarioServico.desativar(req.user, validarId(req.params.id));
    res.status(200).json({ user });
};

const reativar = async (req, res) => {
    const user = await usuarioServico.reativar(req.user, validarId(req.params.id));
    res.status(200).json({ user });
};

module.exports = { listar, obter, criar, editar, trocarPerfil, desativar, reativar };
