const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();


router.post('/login', authController.login);


//router.get('/home', minddware, (req, res) => {
//    res.status(200).json({ message: 'Bem-vindo à página inicial!' });
//});






module.exports = router;