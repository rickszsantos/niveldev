const app = require('../../app');
const authController = require('../controller/authController');



const login = async (req, res) => {
    try {

        const { email, password } = req.body;
        const token = await authService.login(email, password);
        
        res.json({ token });

    } catch (error) {

        res.status(401).json({ error: error.message });
    }
}





module.exports = authController;
