const { chat } = require('../gemini');

function registrar(bot) {
  bot.onText(/\/investir(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const valorTexto = match[1];

    if (!valorTexto) {
      // Mostrar botões com valores pré-definidos
      mostrarBotoesDeValor(bot, chatId);
      return;
    }

    const valor = parsearValor(valorTexto);

    if (valor === null) {
      bot.sendMessage(
        chatId,
        '⚠️ Valor inválido. Use um número positivo.\n\n<i>Exemplo: /investir 300</i>',
        { parse_mode: 'HTML' }
      );
      return;
    }

    await processarInvestimento(bot, chatId, msg.from.id, valor);
  });
}

function mostrarBotoesDeValor(bot, chatId) {
  bot.sendMessage(
    chatId,
    '💰 <b>Quanto deseja investir?</b>\n\nEscolha um valor ou digite <code>/investir 250</code> com o valor que preferir:',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'R$ 50', callback_data: 'investir_50' },
            { text: 'R$ 100', callback_data: 'investir_100' },
            { text: 'R$ 200', callback_data: 'investir_200' },
          ],
          [
            { text: 'R$ 300', callback_data: 'investir_300' },
            { text: 'R$ 500', callback_data: 'investir_500' },
            { text: 'R$ 1.000', callback_data: 'investir_1000' },
          ],
          [
            { text: '✏️ Outro valor', callback_data: 'investir_outro' },
          ],
        ],
      },
    }
  );
}

function parsearValor(texto) {
  // Aceitar "300", "R$300", "R$ 300", "300,00", "300.00"
  const limpo = texto
    .replace(/[rR]\$\s?/, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  const valor = parseFloat(limpo);
  return isNaN(valor) || valor <= 0 ? null : valor;
}

async function processarInvestimento(bot, chatId, userId, valor) {
  bot.sendChatAction(chatId, 'typing');

  try {
    const prompt = `Tenho R$ ${valor.toFixed(2)} para investir hoje. Me dê uma recomendação completa seguindo a estrutura obrigatória (Análise de Momento, Recomendação de Alocação, Ativos Selecionados, Estimativa de Retorno).`;

    const resposta = await chat(userId, prompt);
    await enviarRespostaLonga(bot, chatId, resposta);

    // Mostrar botão de menu após a resposta
    bot.sendMessage(chatId, '👇 O que deseja fazer agora?', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 Investir outro valor', callback_data: 'menu_investir' },
            { text: '💼 Salvar Carteira', callback_data: 'cmd_carteira' },
          ],
        ],
      },
    });
  } catch (error) {
    console.error('Erro no /investir:', error.message);

    const isQuota = error.message && (error.message.includes('429') || error.message.includes('quota'));
    const mensagemErro = isQuota
      ? '⏳ O serviço de IA está temporariamente sobrecarregado. Tente novamente em alguns segundos.'
      : '❌ Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em instantes.';

    bot.sendMessage(chatId, mensagemErro, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Tentar novamente', callback_data: `investir_${valor}` }],
        ],
      },
    });
  }
}

async function enviarRespostaLonga(bot, chatId, texto) {
  const MAX_LENGTH = 4096;

  if (texto.length <= MAX_LENGTH) {
    await bot.sendMessage(chatId, texto);
    return;
  }

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

module.exports = { registrar, enviarRespostaLonga, mostrarBotoesDeValor, processarInvestimento };
