const logService = require('../services/logService');

const listar = async (req, res) => {
    res.status(200).json(await logService.listar(req.query));
};

const acoes = async (req, res) => {
    res.status(200).json({ acoes: await logService.listarAcoes() });
};

module.exports = { listar, acoes };
