const Express = require('express');
const app = Express();

app.use(Express.json());
//app.use("/auth", autRoutes);    
//app.use("/courses", coursesRoutes);    
//app.use("/enrollments", enrollmentsRoutes);    
//app.use("/exams", examsRoutes);    
//app.use("/exercises", exercisesRoutes);    
//app.use("/progress", progressRoutes);    
//app.use("/reviews", reviewsRoutes);   
//app.use("/submissions", submissionsRoutes);  
//app.use("/users", usersRoutes);   



app.get('/', (req, res) => {
    res.json({ message: 'NivelDev API is running' });
});

module.exports = app;