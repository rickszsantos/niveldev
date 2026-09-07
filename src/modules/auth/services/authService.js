const app = require('../../app');
const authService = require('../services/authservice');

const login = async (email, password) => {

if (!email || !password) {
    throw new Error('E-mail e senha são obrigatórios.');
}




    // Implement your login logic here


};


module.exports = authService;