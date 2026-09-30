const authService = require('../services/authService');



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await authService.login(email, password);
        
        res.status(200).json({ token });

    } catch (error) {

        res.status(401).json({ error: error.message });
    }
}





module.exports = { login };
