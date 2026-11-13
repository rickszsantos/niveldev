const path = require('path');
const Express = require('express');
const pool = require('./compartilhado/banco-de-dados/conexao');
const tratadorDeErros = require('./compartilhado/intermediarios/tratadorDeErros');
const autenticacaoRota = require('./modulos/autenticacao/rotas/autenticacaoRota');
const usuarioRota = require('./modulos/usuarios/rotas/usuarioRota');
const registroRota = require('./modulos/registros/rotas/registroRota');
const exercicioRota = require('./modulos/exercicios/rotas/exercicioRota');
const submissaoRota = require('./modulos/submissoes/rotas/submissaoRota');

const app = Express();

app.disable('x-powered-by');





// Atrás de um proxy reverso (nginx, Traefik, Cloudflare...), defina TRUST_PROXY=1
// para o rate limit enxergar o IP real do visitante.
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}





// Enunciados e casos de teste podem ser longos: esta rota aceita até 200 kb.
// Precisa vir ANTES do parser global abaixo (que limita as demais rotas a 10 kb).
app.use('/exercises', Express.json({ limit: '200kb' }));
app.use('/submissions', Express.json({ limit: '100kb' }));
app.use(Express.json({ limit: '10kb' }));






// ---------- API ----------
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(503).json({ status: 'banco indisponível' });
    }
});






app.use('/auth', autenticacaoRota);
app.use('/users', usuarioRota);
app.use('/logs', registroRota);
app.use('/exercises', exercicioRota);
app.use('/submissions', submissaoRota);







// ---------- Frontend (arquivos estáticos; "/" serve o index.html) ----------
app.use(Express.static(path.join(__dirname, '../../frontend')));

app.use(tratadorDeErros);

module.exports = app;
