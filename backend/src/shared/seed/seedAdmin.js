const bcrypt = require('bcryptjs');
const userRepository = require('../../modules/users/repositories/userRepository');
const registrarLog = require('../logs/registrarLog');

// Cria o primeiro administrador a partir das variáveis de ambiente
//   ADMIN_NOME (opcional), ADMIN_EMAIL, ADMIN_PASSWORD
// Só age se AINDA NÃO existe nenhum administrador, então é seguro rodar a cada
// inicialização: depois do primeiro admin, não mexe em mais nada (não troca senha).
//   - e-mail novo      -> cria o usuário já como administrador
//   - e-mail existente -> promove esse usuário a administrador
async function seedAdmin() {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const senha = process.env.ADMIN_PASSWORD || '';
    const nome = (process.env.ADMIN_NOME || 'Administrador').trim();

    if (!email || !senha) return; // seed não configurado
    if (senha.length < 8 || Buffer.byteLength(senha) > 72) {
        console.warn('ADMIN_PASSWORD deve ter de 8 a 72 caracteres. Administrador inicial não criado.');
        return;
    }
    if (await userRepository.existeAdministrador()) return;

    const existente = await userRepository.findByEmail(email);
    if (existente) {
        await userRepository.atualizarPerfil(existente.id, 'administrador');
        await registrarLog(existente.id, 'admin_inicial_promovido', { email });
        console.log(`Usuário ${email} promovido a administrador.`);
        return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const admin = await userRepository.create({ nome, email, senhaHash, perfil: 'administrador' });
    await registrarLog(admin.id, 'admin_inicial_criado', { email });
    console.log(`Administrador inicial criado: ${email}`);
}

module.exports = seedAdmin;
