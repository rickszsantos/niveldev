const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../../../shared/errors/AppError');
const userRepository = require('../../users/repositories/userRepository');
const registrarLog = require('../../../shared/logs/registrarLog');



const BCRYPT_ROUNDS = 10;
const SENHA_MIN = 8;
const SENHA_MAX_BYTES = 72; // limite do bcrypt: o que passar disso seria ignorado
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;





//para não dar tempo diferente caso o usuário não exista, compara com um hash falso (igualando o tempo de resposta)
const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-igualar-tempo', BCRYPT_ROUNDS);






// arrumar: quando o usuario marcar lebrar de min ativar o token por 24h, caso contrario 1h
const gerarToken = (user) =>
    jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });







const register = async ({ nome, email, password }, { ip } = {}) => {
    nome = typeof nome === 'string' ? nome.trim() : '';
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (nome.length < 2 || nome.length > 120) {
        throw new AppError('Informe seu nome (entre 2 e 120 caracteres).', 400);
    }
    if (!EMAIL_REGEX.test(email) || email.length > 255) {
        throw new AppError('Informe um e-mail válido.', 400);
    }
    if (typeof password !== 'string' || password.length < SENHA_MIN) {
        throw new AppError(`A senha deve ter pelo menos ${SENHA_MIN} caracteres.`, 400);
    }
    if (Buffer.byteLength(password) > SENHA_MAX_BYTES) {
        throw new AppError('A senha é muito longa (máximo de 72 caracteres).', 400);
    }

    if (await userRepository.findByEmail(email)) {
        throw new AppError('Este e-mail já está cadastrado.', 409);
    }

    const senhaHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let user;
    try {
        user = await userRepository.create({ nome, email, senhaHash });
    } catch (error) {
        // 23505 = violação de unicidade no Postgres. Cobre a corrida de dois
        // cadastros simultâneos com o mesmo e-mail (o findByEmail acima não pega).
        if (error.code === '23505') {
            throw new AppError('Este e-mail já está cadastrado.', 409);
        }
        throw error;
    }

    await registrarLog(user.id, 'cadastro', { email: user.email, ip });

    return { token: gerarToken(user), user };
};









const login = async (email, password, { ip } = {}) => {
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        throw new AppError('E-mail e senha são obrigatórios.', 400);
    }

    const user = await userRepository.findByEmail(email.trim());

    // Sempre compara com algum hash, exista o usuário ou não.
    const senhaCorreta = await bcrypt.compare(password, user ? user.senha_hash : HASH_FALSO);

    if (!user || !senhaCorreta) {
        // usuário pode ser null (e-mail inexistente): o log fica sem usuario_id.
        await registrarLog(user ? user.id : null, 'login_falha', {
            email: email.trim().slice(0, 255),
            motivo: user ? 'senha_incorreta' : 'email_nao_cadastrado',
            ip,
        });
        throw new AppError('E-mail ou senha inválidos.', 401);
    }

    // Só revela que a conta está desativada depois de a senha estar certa,
    // para não permitir descobrir quais e-mails existem.
    if (!user.ativo) {
        await registrarLog(user.id, 'login_falha', { email: user.email, motivo: 'conta_desativada', ip });
        throw new AppError('Esta conta está desativada.', 403);
    }

    await registrarLog(user.id, 'login_sucesso', { ip });

    return {
        token: gerarToken(user),
        user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil, ativo: user.ativo },
    };
};










const getProfile = async (id) => {
    const user = await userRepository.findById(id);
    // Usuário desativado perde o acesso mesmo com um token ainda válido.
    if (!user || !user.ativo) {
        throw new AppError('Usuário não encontrado.', 401);
    }
    return user;
};

module.exports = { register, login, getProfile };
