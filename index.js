require('dotenv').config();

const { criarBot } = require('./src/bot');
const { inicializar: inicializarGemini } = require('./src/gemini');

// Inicializar Gemini AI
inicializarGemini();

// Inicializar Bot Telegram
criarBot();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 InvestBot encerrado.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 InvestBot encerrado.');
  process.exit(0);
});
