const bcrypt = require('bcryptjs');
const ErroApp = require('../../../compartilhado/erros/ErroApp');
const registrarLog = require('../../../compartilhado/registros/registrarLog');
const usuarioRepositorio = require('../repositorios/usuarioRepositorio');
const v = require('../validadores');

const BCRYPT_ROUNDS = 10;
const EMAIL_DUPLICADO = 'Este e-mail já está cadastrado.';

const ehAdmin = (ator) => ator.perfil === 'administrador';

const buscarOuFalhar = async (id, db) => {
    const user = await usuarioRepositorio.findById(id, db);
    if (!user) throw new ErroApp('Usuário não encontrado.', 404);
    return user;
};

// ---------- listar / ver ----------

const listar = async (query) => {
    const { pagina, limite, offset } = v.lerPaginacao(query);

    const busca = typeof query.busca === 'string' ? query.busca.trim().slice(0, 100) : '';
    const perfil = query.perfil === undefined || query.perfil === '' ? undefined : v.validarPerfil(query.perfil);

    let ativo;
    if (query.ativo !== undefined && query.ativo !== '') {
        if (query.ativo !== 'true' && query.ativo !== 'false') {
            throw new ErroApp('O filtro "ativo" deve ser true ou false.', 400);
        }
        ativo = query.ativo === 'true';
    }

    const { users, total } = await usuarioRepositorio.listar({ busca, perfil, ativo, limite, offset });
    return { users, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
};

// Admin vê qualquer um; os demais só veem a si mesmos.
const obter = async (ator, id) => {
    if (!ehAdmin(ator) && ator.id !== id) {
        throw new ErroApp('Você só pode acessar o seu próprio perfil.', 403);
    }
    return buscarOuFalhar(id);
};

// ---------- criar ----------

const criar = async (ator, { nome, email, password, perfil }) => {
    nome = v.validarNome(nome);
    email = v.validarEmail(email);
    v.validarSenha(password);
    perfil = perfil === undefined ? 'aluno' : v.validarPerfil(perfil);

    if (await usuarioRepositorio.findByEmail(email)) {
        throw new ErroApp(EMAIL_DUPLICADO, 409);
    }

    const senhaHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    let user;
    try {
        user = await usuarioRepositorio.create({ nome, email, senhaHash, perfil });
    } catch (error) {
        if (error.code === '23505') throw new ErroApp(EMAIL_DUPLICADO, 409);
        throw error;
    }

    await registrarLog(ator.id, 'usuario_criado', { alvoId: user.id, email: user.email, perfil: user.perfil });
    return user;
};

// ---------- editar (nome / e-mail) ----------

// Admin edita qualquer um; aluno/professor só editam o próprio cadastro.
// Perfil e "ativo" NÃO mudam por aqui (têm rotas próprias, só para admin).
const editar = async (ator, id, corpo) => {
    if (!ehAdmin(ator) && ator.id !== id) {
        throw new ErroApp('Você só pode editar o seu próprio perfil.', 403);
    }

    const dados = {};
    if (corpo.nome !== undefined) dados.nome = v.validarNome(corpo.nome);
    if (corpo.email !== undefined) dados.email = v.validarEmail(corpo.email);
    if (Object.keys(dados).length === 0) {
        throw new ErroApp('Informe nome e/ou e-mail para atualizar.', 400);
    }

    const antes = await buscarOuFalhar(id);

    let user;
    try {
        user = await usuarioRepositorio.atualizarDados(id, dados);
    } catch (error) {
        if (error.code === '23505') throw new ErroApp(EMAIL_DUPLICADO, 409);
        throw error;
    }

    // Guarda só o que mudou de fato (antes → depois).
    const alteracoes = {};
    for (const campo of Object.keys(dados)) {
        if (antes[campo] !== user[campo]) alteracoes[campo] = { de: antes[campo], para: user[campo] };
    }
    if (Object.keys(alteracoes).length > 0) {
        await registrarLog(ator.id, 'usuario_editado', { alvoId: id, alteracoes });
    }
    return user;
};

// ---------- trocar perfil (admin) ----------

const trocarPerfil = async (ator, id, novoPerfil) => {
    novoPerfil = v.validarPerfil(novoPerfil);

    const { antes, user } = await usuarioRepositorio.comTravaAdmin(async (db) => {
        const atual = await buscarOuFalhar(id, db);
        if (atual.perfil === novoPerfil) return { antes: atual, user: atual };

        // Não pode rebaixar o último administrador ativo (o sistema ficaria sem admin).
        if (atual.perfil === 'administrador' && atual.ativo
            && (await usuarioRepositorio.contarAdminsAtivos(db)) <= 1) {
            throw new ErroApp('Não é possível rebaixar o último administrador.', 409);
        }
        return { antes: atual, user: await usuarioRepositorio.atualizarPerfil(id, novoPerfil, db) };
    });

    if (antes.perfil !== user.perfil) {
        await registrarLog(ator.id, 'perfil_alterado', { alvoId: id, de: antes.perfil, para: user.perfil });
    }
    return user;
};

// ---------- desativar / reativar (admin) ----------

const definirAtivo = async (ator, id, ativo) => {
    if (!ativo && ator.id === id) {
        throw new ErroApp('Você não pode desativar a sua própria conta.', 403);
    }

    const { antes, user } = await usuarioRepositorio.comTravaAdmin(async (db) => {
        const atual = await buscarOuFalhar(id, db);
        if (atual.ativo === ativo) return { antes: atual, user: atual };

        if (!ativo && atual.perfil === 'administrador'
            && (await usuarioRepositorio.contarAdminsAtivos(db)) <= 1) {
            throw new ErroApp('Não é possível desativar o último administrador.', 409);
        }
        return { antes: atual, user: await usuarioRepositorio.atualizarAtivo(id, ativo, db) };
    });

    if (antes.ativo !== user.ativo) {
        await registrarLog(ator.id, ativo ? 'usuario_reativado' : 'usuario_desativado', { alvoId: id });
    }
    return user;
};

const desativar = (ator, id) => definirAtivo(ator, id, false);
const reativar = (ator, id) => definirAtivo(ator, id, true);

module.exports = { listar, obter, criar, editar, trocarPerfil, desativar, reativar };
