const TelegramBot = require('node-telegram-bot-api');
const { chat } = require('./gemini');
const { enviarRespostaLonga } = require('./commands/investir');

// Importar comandos
const startCmd = require('./commands/start');
const investirCmd = require('./commands/investir');
const carteiraCmd = require('./commands/carteira');
const helpCmd = require('./commands/help');

function criarBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN não definido no .env');
    process.exit(1);
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log('🤖 InvestBot iniciando...');

  // Registrar comandos
  startCmd.registrar(bot);
  investirCmd.registrar(bot);
  carteiraCmd.registrar(bot);
  helpCmd.registrar(bot);

  // Handler de mensagens livres (sem comandos)
  bot.on('message', async (msg) => {
    // Ignorar comandos - eles já são tratados pelo onText
    if (msg.text && msg.text.startsWith('/')) return;
    // Ignorar mensagens sem texto
    if (!msg.text) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    bot.sendChatAction(chatId, 'typing');

    try {
      const resposta = await chat(userId, msg.text);
      await enviarRespostaLonga(bot, chatId, resposta);
    } catch (error) {
      console.error('Erro na conversa livre:', error.message);
      bot.sendMessage(
        chatId,
        '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
      );
    }
  });

  // Tratamento de erros de polling
  bot.on('polling_error', (error) => {
    console.error('Erro de polling:', error.code, error.message);
  });

  bot.on('error', (error) => {
    console.error('Erro no bot:', error.message);
  });

  console.log('✅ InvestBot rodando! Aguardando mensagens...');

  return bot;
}

module.exports = { criarBot };
