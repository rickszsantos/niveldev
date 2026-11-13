const submissaoServico = require('../servicos/submissaoServico');
const { validarId } = require('../../usuarios/validadores');





const enviar = async (req, res, next) => {
  try {
    const resposta = await submissaoServico.enviar(req.user, req.body);
    res.status(201).json(resposta);
  } catch (erro) {
    next(erro);
  }
};





const obter = async (req, res, next) => {
  try {
    const id = validarId(req.params.id);
    const submissao = await submissaoServico.obter(req.user, id);
    res.json(submissao);
  } catch (erro) {
    next(erro);
  }
};






const listar = async (req, res, next) => {
  try {
    const resultado = await submissaoServico.listarDoUsuario(req.user, req.query);
    res.json(resultado);
  } catch (erro) {
    next(erro);
  }
};








module.exports = { enviar, obter, listar };