const exerciseService = require('../services/exerciseService');
const testCaseService = require('../services/testCaseService');
const { validarId } = require('../../users/validators');

// req.user = { id, perfil } (preenchido pelo middleware de autenticação).

// ----- exercícios -----

const listar = async (req, res) => {
    res.status(200).json(await exerciseService.listar(req.user, req.query));
};

const obter = async (req, res) => {
    const exercise = await exerciseService.obter(req.user, validarId(req.params.id));
    res.status(200).json({ exercise });
};

const criar = async (req, res) => {
    const exercise = await exerciseService.criar(req.user, req.body);
    res.status(201).json({ exercise });
};

const editar = async (req, res) => {
    const exercise = await exerciseService.editar(req.user, validarId(req.params.id), req.body);
    res.status(200).json({ exercise });
};

const desativar = async (req, res) => {
    const exercise = await exerciseService.desativar(req.user, validarId(req.params.id));
    res.status(200).json({ exercise });
};

const reativar = async (req, res) => {
    const exercise = await exerciseService.reativar(req.user, validarId(req.params.id));
    res.status(200).json({ exercise });
};

// ----- casos de teste -----

const listarCasos = async (req, res) => {
    const casos = await testCaseService.listar(validarId(req.params.id));
    res.status(200).json({ casos_de_teste: casos });
};

const criarCaso = async (req, res) => {
    const caso = await testCaseService.criar(req.user, validarId(req.params.id), req.body);
    res.status(201).json({ caso_de_teste: caso });
};

const editarCaso = async (req, res) => {
    const caso = await testCaseService.editar(
        req.user, validarId(req.params.id), validarId(req.params.casoId), req.body
    );
    res.status(200).json({ caso_de_teste: caso });
};

const removerCaso = async (req, res) => {
    await testCaseService.remover(req.user, validarId(req.params.id), validarId(req.params.casoId));
    res.status(204).end();
};

module.exports = {
    listar, obter, criar, editar, desativar, reativar,
    listarCasos, criarCaso, editarCaso, removerCaso,
};
