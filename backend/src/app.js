const Express = require('express');
const app = Express();
const authRoute = require('./modules/auth/routes/authRoute');

const path = require('path');

app.use(Express.static(path.join(__dirname, '../../frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/pages/index.html'));
});





app.use(Express.json());
app.use("/auth", authRoute);    
//app.use("/courses", coursesRoutes);    
//app.use("/enrollments", enrollmentsRoutes);    
//app.use("/exams", examsRoutes);    
//app.use("/exercises", exercisesRoutes);    
//app.use("/progress", progressRoutes);    
//app.use("/reviews", reviewsRoutes);   
//app.use("/submissions", submissionsRoutes);  
//app.use("/users", usersRoutes);  
//comentaria para teste de git git 



app.get('/', (req, res) => {
    res.json({ message: 'NivelDev API is running' });
});

module.exports = app;