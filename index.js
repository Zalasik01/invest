require('dotenv').config();
const express = require('express');

const { criarBot } = require('./src/bot');
const { inicializar: inicializarGemini } = require('./src/gemini');

// Importar os handlers da Vercel
const webhookHandler = require('./api/webhook');
const indexHandler = require('./api/index');

// Inicializar Gemini AI
inicializarGemini();

// Inicializar Bot Telegram (em modo polling para o dev local receber mensagens ativamente)
// O webhook não será chamado localmente pelo Telegram, então o polling resolve.
criarBot(true);

const app = express();
app.use(express.json()); // para parsear body no webhook

// Rota raiz -> Admin Dashboard / Status
app.get('/', async (req, res) => {
  await indexHandler(req, res);
});

// Opcional: Rota de webhook apontando pro handler (pode ser testada via cURL localmente)
app.post('/api/webhook', async (req, res) => {
  await webhookHandler(req, res);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n🌐 Servidor web rodando em http://localhost:${PORT}`);
  console.log(`✨ Rota de admin acessível em http://localhost:${PORT}/?admin=invest2026\n`);
});

// Graceful shutdown
function fecharApp() {
  console.log('\n👋 InvestBot encerrando...');
  server.close(() => process.exit(0));
}

process.on('SIGINT', fecharApp);
process.on('SIGTERM', fecharApp);
