const registroServico = require('../servicos/registroServico');

const listar = async (req, res) => {
    res.status(200).json(await registroServico.listar(req.query));
};

const acoes = async (req, res) => {
    res.status(200).json({ acoes: await registroServico.listarAcoes() });
};

module.exports = { listar, acoes };
