const mysql = require('mysql2/promise');
require('dotenv').config();
console.log('🔧 Configurando conexão com MySQL...');
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME ||
        'login_simples',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
});
const criarTabelas = async () => {
    try {
        console.log('📋 Criando/verificando tabelas...');

        await pool.execute(`
 CREATE TABLE IF NOT EXISTS usuarios (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nome VARCHAR(80) NOT NULL,
 telefone VARCHAR(20) UNIQUE NOT NULL,
 cpf VARCHAR(14) UNIQUE NOT NULL,
 senha VARCHAR(255) NOT NULL,
 criado_em TIMESTAMP DEFAULT
CURRENT_TIMESTAMP
 )
 `);
        console.log('✅ Tabela de usuários criada/verificada');

    } catch (erro) {
        console.error('❌ Erro ao criar tabelas:',
            erro.message);
        throw erro;
    }
};
const testarConexao = async () => {
    try {
        const conexao = await pool.getConnection();
        console.log('✅ Conexão MySQL estabelecida');
        conexao.release();
        return true;
    } catch (erro) {
        console.error('❌ Erro MySQL:', erro.message);
        return false;
    }
};
module.exports = {
    pool, criarTabelas,
    testarConexao
};