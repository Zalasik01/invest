const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('./config');
const { buscarHistorico, salvarMensagem, buscarCarteira } = require('./database');

let genAI;
let model;

function inicializar() {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
  console.log('✅ Gemini AI inicializado (gemini-2.0-flash)');
}

async function chat(idUsuario, mensagem) {
  if (!model) inicializar();

  // Buscar carteira do usuário para contexto
  const carteira = buscarCarteira(idUsuario);
  let contextoCarteira = '';
  if (carteira && carteira.length > 0) {
    const ativos = carteira
      .map((a) => `${a.codigo} (${a.quantidade} cotas)`)
      .join(', ');
    contextoCarteira = `\n\n[CONTEXTO: A carteira atual do usuário é: ${ativos}]`;
  }

  // Buscar histórico de conversas
  const historico = buscarHistorico(idUsuario);
  
  // Montar o histórico para o Gemini
  const history = historico.map((msg) => ({
    role: msg.papel,
    parts: [{ text: msg.conteudo }],
  }));

  // Criar chat com histórico
  const chatSession = model.startChat({
    history,
  });

  // Enviar mensagem com contexto da carteira
  const mensagemCompleta = mensagem + contextoCarteira;
  
  // Salvar mensagem do usuário
  salvarMensagem(idUsuario, 'user', mensagem);

  try {
    const result = await chatSession.sendMessage(mensagemCompleta);
    const resposta = result.response.text();

    // Salvar resposta do modelo
    salvarMensagem(idUsuario, 'model', resposta);

    return resposta;
  } catch (error) {
    // Remover mensagem do user se deu erro para não ficar inconsistente
    console.error('Erro ao chamar Gemini:', error.message);
    throw error;
  }
}

module.exports = {
  inicializar,
  chat,
};
