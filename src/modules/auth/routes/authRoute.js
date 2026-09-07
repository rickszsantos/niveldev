const app = requeri('../../app');
const authRoute = require('../routes/authRoute');
const authController = require('../controller/authController');

app.post('/login', authController.login);





module.exports = authRoute;