const { chat } = require('../gemini');

function registrar(bot) {
  bot.onText(/\/investir(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const valorTexto = match[1];

    if (!valorTexto) {
      bot.sendMessage(
        chatId,
        '⚠️ Por favor, informe o valor que deseja investir.\n\n<i>Exemplo: /investir 300</i>',
        { parse_mode: 'HTML' }
      );
      return;
    }

    // Limpar o valor (aceitar "300", "R$300", "R$ 300", "300,00", "300.00")
    const valorLimpo = valorTexto
      .replace(/[rR]\$\s?/, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();

    const valor = parseFloat(valorLimpo);

    if (isNaN(valor) || valor <= 0) {
      bot.sendMessage(
        chatId,
        '⚠️ Valor inválido. Use um número positivo.\n\n<i>Exemplo: /investir 300</i>',
        { parse_mode: 'HTML' }
      );
      return;
    }

    bot.sendChatAction(chatId, 'typing');

    try {
      const prompt = `Tenho R$ ${valor.toFixed(2)} para investir hoje. Me dê uma recomendação completa seguindo a estrutura obrigatória (Análise de Momento, Recomendação de Alocação, Ativos Selecionados, Estimativa de Retorno).`;

      const resposta = await chat(userId, prompt);
      await enviarRespostaLonga(bot, chatId, resposta);
    } catch (error) {
      console.error('Erro no /investir:', error.message);
      bot.sendMessage(
        chatId,
        '❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em instantes.'
      );
    }
  });
}

async function enviarRespostaLonga(bot, chatId, texto) {
  const MAX_LENGTH = 4096;

  if (texto.length <= MAX_LENGTH) {
    await bot.sendMessage(chatId, texto);
    return;
  }

  // Dividir em chunks respeitando parágrafos
  const partes = [];
  let atual = '';

  const linhas = texto.split('\n');
  for (const linha of linhas) {
    if ((atual + '\n' + linha).length > MAX_LENGTH) {
      partes.push(atual.trim());
      atual = linha;
    } else {
      atual += (atual ? '\n' : '') + linha;
    }
  }
  if (atual.trim()) partes.push(atual.trim());

  for (const parte of partes) {
    await bot.sendMessage(chatId, parte);
  }
}

module.exports = { registrar, enviarRespostaLonga };
