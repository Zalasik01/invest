/**
 * Script para registrar o webhook do Telegram na Vercel.
 *
 * Uso:
 *   node scripts/configurarWebhook.js https://seu-projeto.vercel.app
 */

require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const vercelUrl = process.argv[2] || process.env.VERCEL_URL;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN não definido no .env');
  process.exit(1);
}

if (!vercelUrl) {
  console.error('❌ Passe a URL da Vercel como argumento:');
  console.error('   node scripts/configurarWebhook.js https://seu-projeto.vercel.app');
  process.exit(1);
}

const urlBase = vercelUrl.replace(/\/$/, '');
const webhookUrl = `${urlBase}/api/webhook`;

async function configurar() {
  console.log(`📡 Configurando webhook para: ${webhookUrl}`);

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  );
  const data = await response.json();

  if (data.ok) {
    console.log('✅ Webhook configurado com sucesso!');
  } else {
    console.error('❌ Erro:', data.description);
  }

  const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const infoData = await info.json();
  console.log(`📋 URL ativa: ${infoData.result.url}`);
  console.log(`📋 Pending: ${infoData.result.pending_update_count}`);
}

configurar().catch(console.error);
