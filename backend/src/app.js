const path = require('path');
const Express = require('express');
const pool = require('./shared/database/pool');
const errorHandler = require('./shared/minddware/errorHandler');
const authRoute = require('./modules/auth/routes/authRoute');

const app = Express();

app.disable('x-powered-by');

// Atrás de um proxy reverso (nginx, Traefik, Cloudflare...), defina TRUST_PROXY=1
// para o rate limit enxergar o IP real do visitante.
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

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

app.use('/auth', authRoute);
//app.use("/courses", coursesRoutes);
//app.use("/enrollments", enrollmentsRoutes);
//app.use("/exams", examsRoutes);
//app.use("/exercises", exercisesRoutes);
//app.use("/progress", progressRoutes);
//app.use("/reviews", reviewsRoutes);
//app.use("/submissions", submissionsRoutes);
//app.use("/users", usersRoutes);

// ---------- Frontend (arquivos estáticos; "/" serve o index.html) ----------
app.use(Express.static(path.join(__dirname, '../../frontend')));

app.use(errorHandler);

module.exports = app;
