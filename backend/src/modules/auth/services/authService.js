const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../../../shared/errors/AppError');
const userRepository = require('../../users/repositories/userRepository');

const BCRYPT_ROUNDS = 10;
const SENHA_MIN = 8;
const SENHA_MAX_BYTES = 72; // limite do bcrypt: o que passar disso seria ignorado
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hash "de mentira" usado quando o e-mail não existe, para que o login
// leve o mesmo tempo com e-mail certo ou errado (evita descobrir quais
// e-mails estão cadastrados medindo o tempo de resposta).
const HASH_FALSO = bcrypt.hashSync('senha-falsa-para-igualar-tempo', BCRYPT_ROUNDS);

const gerarToken = (user) =>
    jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

const register = async ({ nome, email, password }) => {
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

    return { token: gerarToken(user), user };
};

const login = async (email, password) => {
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        throw new AppError('E-mail e senha são obrigatórios.', 400);
    }

    const user = await userRepository.findByEmail(email.trim());

    // Sempre compara com algum hash, exista o usuário ou não.
    const senhaCorreta = await bcrypt.compare(password, user ? user.senha_hash : HASH_FALSO);

    if (!user || !senhaCorreta) {
        throw new AppError('E-mail ou senha inválidos.', 401);
    }

    return {
        token: gerarToken(user),
        user: { id: user.id, nome: user.nome, email: user.email },
    };
};

const getProfile = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        throw new AppError('Usuário não encontrado.', 401);
    }
    return user;
};

module.exports = { register, login, getProfile };
