const { inicializar: inicializarGemini } = require('../src/gemini');
const { criarBot } = require('../src/bot');

// Inicializar Gemini AI (necessário na Vercel, pois index.js não roda)
inicializarGemini();

// Criar bot em modo webhook (sem polling)
const bot = criarBot(false);

module.exports = async function handler(req, res) {
  console.log(`[VERCEL WEBHOOK] Recebeu requisição: ${req.method}`, req.url);
  
  if (req.method === 'POST') {
    console.log('[VERCEL WEBHOOK] Payload body recebido:', JSON.stringify(req.body).substring(0, 200) + '...');
    try {
      bot.processUpdate(req.body);
      console.log('[VERCEL WEBHOOK] processUpdate chamado com sucesso. Aguardando promises (se houver)...');
      
      // Aguardar que todos os handlers (Supabase, Gemini) terminem!
      // Se não fizermos isso, a Vercel mata a função na metade e cancela a resposta.
      await bot.waitForPromises();
      
      console.log('[VERCEL WEBHOOK] Promises finalizadas. Respondendo 200 OK para o Telegram.');
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('[VERCEL WEBHOOK] Erro no webhook:', error.message);
      res.status(200).json({ ok: true });
    }
  } else {
    console.log('[VERCEL WEBHOOK] GET hit na API.');
    res.status(200).json({ status: 'InvestBot webhook ativo 🤖' });
  }
};
