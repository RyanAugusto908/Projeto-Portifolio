const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const { pool, criarTabelas, testarConexao } =
    require('./database');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3001;
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,
    'public')));
// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} -
${req.method} ${req.url}`);
    next();
});
// Rota de status
app.get('/api/status', (req, res) => {
    res.json({
        status: 'API funcionando!',
        timestamp: new Date().toISOString()
    });
});
// Rota de registro
app.post('/api/registrar', async (req, res) => {
    let conexao;
    try {
        const { nome, telefone, cpf, senha,
            confirmarSenha } = req.body;

        console.log('📝 Tentativa de registro:', {
            nome, telefone, cpf
        });
        // Validações
        if (!nome || !telefone || !cpf || !senha ||
            !confirmarSenha) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }
        if (senha !== confirmarSenha) {
            return res.status(400).json({ erro: 'As senhas não coincidem' });
        }
        if (senha.length < 6) {
            return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres' });
        }
        conexao = await pool.getConnection();

        // Verificar se telefone ou CPF já existem
        const [existentes] = await conexao.execute(
            'SELECT id FROM usuarios WHERE telefone = ? OR cpf = ?',
            [telefone, cpf]
        );
        if (existentes.length > 0) {
            return res.status(409).json({
                erro:
                    'Telefone ou CPF já cadastrado'
            });
        }
        // Hash da senha
        const saltRounds = 12;
        const senhaHash = await bcrypt.hash(senha,
            saltRounds);
        // Inserir usuário
        const [resultado] = await conexao.execute(
            'INSERT INTO usuarios (nome, telefone, cpf, senha) VALUES (?, ?, ?, ?)',
            [nome, telefone, cpf, senhaHash]
        );
        console.log('✅ Usuário registrado com sucesso - ID:', resultado.insertId);

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: {
                id: resultado.insertId,
                nome,
                telefone,
                cpf
            }
        });
    } catch (erro) {
        console.error('❌ Erro no registro:', erro);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            detalhes: process.env.NODE_ENV ===
                'development' ? erro.message : undefined
        });
    } finally {
        if (conexao) conexao.release();
    }
});

// Rota de login
app.post('/api/login', async (req, res) => {
    let conexao;
    try {
        const { telefone, senha } = req.body;
        console.log('🔑 Tentativa de login:', {
            telefone
        });
        if (!telefone || !senha) {
            return res.status(400).json({
                erro:
                    'Telefone e senha são obrigatórios'
            });
        }
        conexao = await pool.getConnection();

        const [usuarios] = await conexao.execute(
            'SELECT * FROM usuarios WHERE telefone = ?',
            [telefone]
        );
        if (usuarios.length === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        const usuario = usuarios[0];

        // Verificar senha
        const senhaCorreta = await
            bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Senha incorreta' });
        }

        console.log('✅ Login realizado com sucesso:',
            usuario.nome);

        res.json({
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                telefone: usuario.telefone,
                cpf: usuario.cpf
            }
        });
    } catch (erro) {
        console.error('❌ Erro no login:', erro);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    } finally {
        if (conexao) conexao.release();
    }
});
// Rota para servir o frontend - DEVE SER A ÚLTIMA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public',
        'index.html'));
});
// Inicialização
const iniciarServidor = async () => {
    try {
        console.log('🔧 Iniciando servidor...');

        const mysqlConectado = await testarConexao();
        if (!mysqlConectado) {
            console.error('❌ Não foi possível conectar ao MySQL');
            process.exit(1);
        }

        await criarTabelas();

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 Frontend: http://localhost:${PORT}`);
            console.log('✅ Sistema de login SIMPLES - com senha');
        });

    } catch (erro) {
        console.error('❌ Erro na inicialização:',
            erro);
        process.exit(1);
    }
};
iniciarServidor();