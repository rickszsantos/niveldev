const jwt = require('jsonwebtoken');
const user = [{id: 0, email: 'user@gmail.com', password: '123'}]



const login = async (email, password) => {


    


    if (!email || !password) {
        throw new Error('E-mail ie senha são obrigatórios.');
    }
    if (email === user[0].email && password === user[0].password) {
        
        const token = jwt.sign({ id: user[0].id}, process.env.JWT_SECRET, { expiresIn: '1h' });
        return token;

    }else {
        throw new Error('E-mail ou senha inválidos.');
    }

};






module.exports = { login };