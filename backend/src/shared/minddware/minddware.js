require('dotenv').config();
const jwt = require('jsonwebtoken');

function minddware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    

    const token = authHeader?.split(' ')[1];


    if (!token) {
        return res.status(401).json({ message: 'Token inválido' });
    }


    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('\n\nDecoded:', decoded);
        req.user = decoded;
        next();

    } catch (error) {

        console.error('Erro ao verificar o token:', error);
        return res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = minddware;