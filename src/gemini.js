const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SYSTEM_PROMPT } = require('./config');
const { buscarHistorico, salvarMensagem, buscarCarteira } = require('./database');

let genAI;
let model;

function inicializar() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'sua_api_key_aqui') {
    throw new Error('❌ GEMINI_API_KEY não definida ou inválida no .env');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
  console.log('✅ Gemini AI inicializado (gemini-2.5-flash)');
}

/**
 * Envia mensagem ao Gemini com retry automático para erro 429
 */
async function enviarComRetry(chatSession, mensagem, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const result = await chatSession.sendMessage(mensagem);
      return result;
    } catch (error) {
      const is429 = error.message && error.message.includes('429');
      const isRateLimit = error.message && error.message.includes('quota');

      if ((is429 || isRateLimit) && i < tentativas - 1) {
        const espera = Math.pow(2, i + 1) * 5000;
        console.log(`⏳ Rate limit atingido. Tentando em ${espera / 1000}s... (${i + 2}/${tentativas})`);
        await new Promise((resolve) => setTimeout(resolve, espera));
      } else {
        throw error;
      }
    }
  }
}

async function chat(idUsuario, mensagem) {
  if (!model) inicializar();

  // Buscar carteira do usuário para contexto
  const carteira = await buscarCarteira(idUsuario);
  let contextoCarteira = '';
  if (carteira && carteira.length > 0) {
    const ativos = carteira
      .map((a) => `${a.codigo} (${a.quantidade} cotas)`)
      .join(', ');
    contextoCarteira = `\n\n[CONTEXTO: A carteira atual do usuário é: ${ativos}]`;
  }

  // Buscar histórico de conversas
  const historico = await buscarHistorico(idUsuario);

  // Montar o histórico para o Gemini
  const history = historico.map((msg) => ({
    role: msg.papel,
    parts: [{ text: msg.conteudo }],
  }));

  // Criar chat com histórico
  const chatSession = model.startChat({ history });
  const mensagemCompleta = mensagem + contextoCarteira;

  // Salvar mensagem do usuário
  await salvarMensagem(idUsuario, 'user', mensagem);

  try {
    const result = await enviarComRetry(chatSession, mensagemCompleta);
    const resposta = result.response.text();

    // Salvar resposta do modelo
    await salvarMensagem(idUsuario, 'model', resposta);

    return resposta;
  } catch (error) {
    console.error('Erro ao chamar Gemini:', error.message);
    throw error;
  }
}

module.exports = {
  inicializar,
  chat,
};
