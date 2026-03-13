require('dotenv').config();
const express = require('express');

const { criarBot } = require('./src/bot');
const { inicializar: inicializarGemini } = require('./src/gemini');

// Importar os handlers da Vercel
const webhookHandler = require('./api/webhook');
const statsHandler = require('./api/stats');
const authHandler = require('./api/auth');

// Inicializar Gemini AI
inicializarGemini();

criarBot(true);

const app = express();
app.use(express.json()); // para parsear body

// APIs Back-End Locais (Espelhos da Vercel)
app.get('/api/stats', async (req, res) => await statsHandler(req, res));
app.post('/api/auth', async (req, res) => await authHandler(req, res));
app.post('/api/webhook', async (req, res) => await webhookHandler(req, res));

// Servir os arquivos estáticos compilados pelo Vite no Front-End
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));

// Qualquer outra requisição envia o React App (Client-side routing fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n🌐 Backend Local rodando em http://localhost:${PORT}`);
  console.log(`✨ Vite Dev Server ou App React está pronto! Mande \`npm run dev\` se estiver desenvolvendo.`);
});

// Graceful shutdown
function fecharApp() {
  console.log('\n👋 InvestBot encerrando...');
  server.close(() => process.exit(0));
}

process.on('SIGINT', fecharApp);
process.on('SIGTERM', fecharApp);
