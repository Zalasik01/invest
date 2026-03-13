const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const { Buffer } = require('buffer');

// Inicializa cliente oficial do Supabase usando as chaves globais da aplicação que já existem no .env
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { matricula, name, description, avatarBase64 } = req.body;
  const adminMatricula = process.env.ADMIN_MATRICULA || 'invest2026';
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Proteção básica por matrícula
  if (matricula !== adminMatricula) {
    return res.status(401).json({ success: false, error: 'Não autorizado.' });
  }

  try {
    const results = { name: false, description: false, avatar: false };

    // 1. Atualizar Título/Nome do Bot
    if (name) {
      const nameRes = await fetch(`https://api.telegram.org/bot${token}/setMyName`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const nameData = await nameRes.json();
      results.name = nameData.ok;
    }

    // 2. Atualizar Descrição (Bio) do Bot
    if (description !== undefined) {
       // setMyDescription modifica o texto da "About" message do bot
       const descRes = await fetch(`https://api.telegram.org/bot${token}/setMyDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      const descData = await descRes.json();
      
      // setMyShortDescription modifica o Subtitle (embaixo do nome)
      const shortDescRes = await fetch(`https://api.telegram.org/bot${token}/setMyShortDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ short_description: description.substring(0, 110) }) // Max limit
      });
      
      const shortDescData = await shortDescRes.json();
      results.description = descData.ok && shortDescData.ok;
    }

    // 3. Processar e Enviar a Imagem do Avatar
    if (avatarBase64) {
      const base64Data = avatarBase64.replace(/^data:image\/\w+;base64,/, "");
      const mimeMatch = avatarBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const fileExt = mimeType.split('/')[1];
      
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `bot-avatar-${Date.now()}.${fileExt}`;
      const bucketName = 'assets'; // Nome padrão solicitado na infra

      console.log(`[CONFIG] Fase 1: Arquivando cópia local no Supabase Storage: bucket '${bucketName}' / ${fileName}`);

      // A. Armazenar no Supabase Storage Nativo e obter URL pública (se existirem credenciais)
      if (process.env.SUPABASE_URL) {
         const { data, error } = await supabase
          .storage
           .from(bucketName)
           .upload(fileName, buffer, {
             contentType: mimeType,
             upsert: true
           });
           
         if (error) console.error("[CONFIG] Erro salvando cópia no Supabase Storage:", error.message);
      }

      console.log(`[CONFIG] Fase 2: Forçando FormData multipart de troca de Avatar via Telegram API`);

      // B. Enviar a imagem como um File Buffer usando a tag multipart oficial do telegram "setMyProfilePhoto" 
      // Não confunda com enviar mensagem, trata-se de edição de properties do bot. Não existe setMyProfilePhoto, há o "setChatPhoto" 
      // Mas para bot profiles o telegram recém adicionou o bot user commands options ou usar API secreta, portanto não há documentação
      // Como contorno faremos com que esse payload suba o arquivo pela biblioteca global node se tiver.
      // O método existente do TG bot de fato não gerencia a "Profile photo real" apenas a "Description Picture", ou seja `setChatPhoto` so funcionam p/ Canais.
      
      // ALERTA: Não há método oficial na Telegram Bot API `https://core.telegram.org/bots/api` 
      // para trocar a Foto do PRÓPRIO BOT (Avatar Circular). 
      // O Upload só pode ser feito pelo @BotFather (`/setuserpic`).
      // Apenas Nome e Descrição são expostos em `setMyName` e `setMyDescription`.
      // Portanto retornaremos falso amigavelmente ao front-end ou abortaremos.
      
      results.avatar = false; // "Not Supported by Telegram REST API"
      console.log("[CONFIG] Update de Avatar rejeitado: Telegram API REST não possui rota para modificar *BOT Profile Pictures*. Requisita @BotFather inter-ação.")
    }

    return res.status(200).json({ success: true, results });

  } catch (error) {
    console.error('[CONFIG] Erro crítico ao atualizar o bot:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao aplicar com a API.', details: error.message });
  }
};
