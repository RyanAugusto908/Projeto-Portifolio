let usuarioLogado = null;
const API_BASE_URL = 'http://localhost:3002'; // ADICIONE ESTA LINHA

// Mostrar formulário de registro
function mostrarRegistro() {
    document.getElementById('registro-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('area-logada').style.display = 'none';
    limparMensagem();
    limparFormularios();
}

// Mostrar formulário de login
function mostrarLogin() {
    document.getElementById('registro-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('area-logada').style.display = 'none';
    limparMensagem();
    limparFormularios();
}

// Mostrar área logada
function mostrarAreaLogada(usuario) {
    usuarioLogado = usuario;
    document.getElementById('registro-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('area-logada').style.display = 'block';
   
    document.getElementById('dados-usuario').innerHTML = `
        <strong>Nome:</strong> ${usuario.nome}<br>
        <strong>Telefone:</strong> ${usuario.telefone}<br>
        <strong>CPF:</strong> ${usuario.cpf}<br>
        <strong>ID:</strong> ${usuario.id}
    `;
}

// Sair do sistema
function sair() {
    usuarioLogado = null;
    mostrarLogin();
    limparMensagem();
    limparFormularios();
}

// Limpar formulários
function limparFormularios() {
    document.getElementById('formRegistro').reset();
    document.getElementById('formLogin').reset();
}

// Mostrar mensagem
function mostrarMensagem(texto, tipo) {
    const divMensagem = document.getElementById('mensagem');
    divMensagem.textContent = texto;
    divMensagem.className = tipo === 'sucesso' ? 'mensagem-sucesso' : 'mensagem-erro';
}

// Limpar mensagem
function limparMensagem() {
    document.getElementById('mensagem').textContent = '';
    document.getElementById('mensagem').className = '';
}

// Função para fazer requisições com tratamento de erro melhorado
async function fazerRequisicao(endpoint, dados) { // Mudei para endpoint
    try {
        const url = `${API_BASE_URL}${endpoint}`; // URL COMPLETA
        console.log(`🌐 Fazendo requisição para: ${url}`);
       
        const resposta = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        console.log(`📊 Status da resposta: ${resposta.status}`);
       
        // Verificar se a resposta é JSON
        const contentType = resposta.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await resposta.text();
            console.error('❌ Resposta não é JSON:', text.substring(0, 100));
            throw new Error(`Erro do servidor (${resposta.status}): ${text.substring(0, 50)}...`);
        }

        const resultado = await resposta.json();
       
        return {
            sucesso: resposta.ok,
            dados: resultado
        };
       
    } catch (erro) {
        console.error('❌ Erro na requisição:', erro);
        throw erro;
    }
}

// Formulário de registro
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    e.preventDefault();
   
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
   
    // Verificar se as senhas coincidem
    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem!', 'erro');
        return;
    }
   
    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'erro');
        return;
    }

    const dados = {
        nome: document.getElementById('nome').value,
        telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
        cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
        senha: senha,
        confirmarSenha: confirmarSenha
    };

    console.log('📝 Enviando dados:', dados);

    try {
        const resultado = await fazerRequisicao('/api/registrar', dados);

        if (resultado.sucesso) {
            mostrarMensagem('Cadastro realizado com sucesso!', 'sucesso');
            mostrarAreaLogada(resultado.dados.usuario);
        } else {
            mostrarMensagem(resultado.dados.erro, 'erro');
        }
    } catch (erro) {
        mostrarMensagem('Erro de conexão: ' + erro.message, 'erro');
    }
});

// Formulário de login
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
   
    const dados = {
        telefone: document.getElementById('loginTelefone').value.replace(/\D/g, ''),
        senha: document.getElementById('loginSenha').value
    };

    console.log('🔑 Enviando dados de login:', { telefone: dados.telefone });

    try {
        const resultado = await fazerRequisicao('/api/login', dados);

        if (resultado.sucesso) {
            mostrarMensagem('Login realizado com sucesso!', 'sucesso');
            mostrarAreaLogada(resultado.dados.usuario);
        } else {
            mostrarMensagem(resultado.dados.erro, 'erro');
        }
    } catch (erro) {
        mostrarMensagem('Erro de conexão: ' + erro.message, 'erro');
    }
});

// Inicializar com registro
mostrarRegistro();

console.log('✅ Script carregado - Sistema pronto');
