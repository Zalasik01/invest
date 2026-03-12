const { criarBot } = require('../src/bot');

// Criar bot em modo webhook (sem polling)
const bot = criarBot(false);

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      bot.processUpdate(req.body);
      // Aguardar que todos os handlers (Supabase, Gemini) terminem!
      // Se não fizermos isso, a Vercel mata a função na metade e cancela a resposta.
      await bot.waitForPromises();
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Erro no webhook:', error.message);
      res.status(200).json({ ok: true });
    }
  } else {
    res.status(200).json({ status: 'InvestBot webhook ativo 🤖' });
  }
};
