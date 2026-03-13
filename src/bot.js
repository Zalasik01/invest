const TelegramBot = require('node-telegram-bot-api');
const { chat } = require('./gemini');
const { buscarCarteira, registrarUsuario } = require('./database');
const { HELP_MESSAGE } = require('./config');
const { formatarParaTelegram } = require('./formatador');

// Importar comandos
const startCmd = require('./commands/start');
const carteiraCmd = require('./commands/carteira');

// Controle de usuários com processamento em andamento
const processando = new Set();

// Botões do menu principal
const MENU_PRINCIPAL = {
  inline_keyboard: [
    [
      { text: '💰 Investir', callback_data: 'menu_investir' },
      { text: '💼 Minha Carteira', callback_data: 'cmd_carteira' },
    ],
    [
      { text: '❓ Ajuda', callback_data: 'cmd_help' },
    ],
  ],
};

// Botões de valores de investimento
const BOTOES_VALORES = {
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
      { text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' },
    ],
  ],
};

/**
 * Envia texto longo dividido em partes de 4096 caracteres
 */
async function enviarRespostaLonga(bot, chatId, texto) {
  const MAX = 4096;
  if (texto.length <= MAX) {
    await bot.sendMessage(chatId, texto, { parse_mode: 'HTML' });
    return;
  }

  const partes = [];
  let atual = '';
  for (const linha of texto.split('\n')) {
    if ((atual + '\n' + linha).length > MAX) {
      partes.push(atual.trim());
      atual = linha;
    } else {
      atual += (atual ? '\n' : '') + linha;
    }
  }
  if (atual.trim()) partes.push(atual.trim());

  for (const parte of partes) {
    await bot.sendMessage(chatId, parte, { parse_mode: 'HTML' });
  }
}

/**
 * Cria o bot Telegram.
 * @param {boolean} polling - true para dev local, false para webhook (Vercel)
 */
function criarBot(polling = true) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token === 'seu_token_aqui') {
    throw new Error('❌ TELEGRAM_BOT_TOKEN não definido no .env');
  }

  const bot = new TelegramBot(token, { polling });

  // -------------------------------------------------------------
  // TRUQUE PARA VERCEL SERVERLESS: Rastrear Promises ativas
  // Como Vercel congela o processo quando a requisição HTTP termina,
  // precisamos aguardar que todos os handlers terminem (ex: Gemini)
  // -------------------------------------------------------------
  bot.pendingPromises = [];
  const originalOn = bot.on.bind(bot);
  bot.on = (event, listener) => {
    return originalOn(event, (...args) => {
      try {
        const p = listener(...args);
        if (p && typeof p.then === 'function') {
          bot.pendingPromises.push(p);
          p.catch((e) => console.error('Erro no listener:', e.message))
           .finally(() => {
             bot.pendingPromises = bot.pendingPromises.filter(prom => prom !== p);
           });
        }
      } catch (err) {
        console.error('Erro síncrono no listener:', err.message);
      }
    });
  };

  const originalOnText = bot.onText.bind(bot);
  bot.onText = (regexp, listener) => {
    return originalOnText(regexp, (...args) => {
      try {
        const p = listener(...args);
        if (p && typeof p.then === 'function') {
          bot.pendingPromises.push(p);
          p.catch((e) => console.error('Erro no onText:', e.message))
           .finally(() => {
             bot.pendingPromises = bot.pendingPromises.filter(prom => prom !== p);
           });
        }
      } catch (err) {
        console.error('Erro síncrono no onText:', err.message);
      }
    });
  };

  bot.waitForPromises = async () => {
    while (bot.pendingPromises.length > 0) {
      // Cria uma cópia para evitar loop infinito caso novas promises sejam adicionadas
      const promisesAtuais = [...bot.pendingPromises];
      await Promise.allSettled(promisesAtuais);
      // O loop continua se novas promises foram parar no array original
    }
  };
  // -------------------------------------------------------------

  console.log('🤖 InvestBot iniciando...');

  // Configurar menu de comandos do Telegram (botão azul no canto inferior)
  bot.setMyCommands([
    { command: 'start', description: '🏠 Abrir menu principal' },
    { command: 'investir', description: '💰 Receber recomendação de investimento' },
    { command: 'carteira', description: '💼 Ver ou salvar carteira' },
    { command: 'help', description: '❓ Ajuda' },
  ]).catch((err) => console.error('Erro ao definir comandos:', err.message));

  // Registrar comandos
  startCmd.registrar(bot);
  carteiraCmd.registrar(bot);

  // Comando /investir — mostra botões de valor
  bot.onText(/\/investir/, (msg) => {
    console.log('[BOT EVENT] Comando /investir detectado de:', msg.from.id);
    return bot.sendMessage(
      msg.chat.id,
      '💰 <b>Quanto deseja investir?</b>\n\nEscolha um valor abaixo:',
      { parse_mode: 'HTML', reply_markup: BOTOES_VALORES }
    );
  });

  // Comando /help
  bot.onText(/\/help/, (msg) => {
    console.log('[BOT EVENT] Comando /help detectado de:', msg.from.id);
    return bot.sendMessage(msg.chat.id, HELP_MESSAGE, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' }]] },
    });
  });

  // ==========================================
  // Handler de botões inline (callback_query)
  // ==========================================
  bot.on('callback_query', async (query) => {
    console.log('[BOT EVENT] Callback query recebido:', query.data);
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;
    const data = query.data;

    // Registrar usuário automaticamente (em background)
    const pRegistrar = registrarUsuario(query.from).catch(() => {});
    if (bot.pendingPromises) bot.pendingPromises.push(pRegistrar);

    // Se já está processando, bloquear cliques
    if (processando.has(userId)) {
      return bot.answerCallbackQuery(query.id, {
        text: '⏳ Aguarde, ainda estou processando...',
        show_alert: false,
      }).catch(() => {});
    }

    const pAnswer = bot.answerCallbackQuery(query.id).catch(() => {});
    if (bot.pendingPromises) bot.pendingPromises.push(pAnswer);

    // --- Menu principal ---
    if (data === 'cmd_menu') {
      return bot.editMessageText('🤖 <b>InvestBot</b> — O que deseja fazer?', {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: MENU_PRINCIPAL,
      });
    }

    // --- Tela de investir ---
    if (data === 'menu_investir') {
      return bot.editMessageText(
        '💰 <b>Quanto deseja investir?</b>\n\nEscolha um valor abaixo:',
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: BOTOES_VALORES,
        }
      );
    }

    // --- Carteira ---
    if (data === 'cmd_carteira') {
      const carteira = await buscarCarteira(userId);

      if (!carteira || carteira.length === 0) {
        return bot.editMessageText(
          '📂 Você ainda não salvou sua carteira.\n\nEnvie no chat:\n<code>/carteira MXRF11 11, PETR3 2, ITUB4 1</code>',
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' }]] },
          }
        );
      } else {
        let mensagem = '💼 <b>Sua Carteira Atual:</b>\n\n';
        carteira.forEach((ativo, i) => {
          mensagem += `${i + 1}. <b>${ativo.codigo}</b> - ${ativo.quantidade} cota${ativo.quantidade > 1 ? 's' : ''}\n`;
        });
        mensagem += '\nPara atualizar:\n<code>/carteira MXRF11 11, PETR3 2</code>';
        return bot.editMessageText(mensagem, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💰 Investir', callback_data: 'menu_investir' },
                { text: '🔙 Menu', callback_data: 'cmd_menu' },
              ],
            ],
          },
        });
      }
    }

    // --- Ajuda ---
    if (data === 'cmd_help') {
      return bot.editMessageText(HELP_MESSAGE, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' }]] },
      });
    }

    // --- Processar investimento ---
    if (data.startsWith('investir_')) {
      const valor = parseFloat(data.replace('investir_', ''));
      if (isNaN(valor) || valor <= 0) return;

      processando.add(userId);

      // Mostrar loading
      await bot.editMessageText(
        `⏳ <b>Analisando o mercado para R$ ${valor.toFixed(2)}...</b>\n\n🔄 Isso pode levar alguns segundos.`,
        { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
      );

      const pAction = bot.sendChatAction(chatId, 'typing').catch(() => {});
      if (bot.pendingPromises) bot.pendingPromises.push(pAction);

      try {
        const prompt = `Tenho R$ ${valor.toFixed(2)} para investir hoje. Me dê uma recomendação completa seguindo a estrutura obrigatória (Análise de Momento, Recomendação de Alocação, Ativos Selecionados, Estimativa de Retorno).`;
        const respostaRaw = await chat(userId, prompt);
        const resposta = formatarParaTelegram(respostaRaw);

        await enviarRespostaLonga(bot, chatId, resposta);

        // Menu pós-resposta
        return bot.sendMessage(chatId, '👇 O que deseja fazer agora?', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💰 Investir outro valor', callback_data: 'menu_investir' },
                { text: '💼 Minha Carteira', callback_data: 'cmd_carteira' },
              ],
              [{ text: '🏠 Menu Principal', callback_data: 'cmd_menu' }],
            ],
          },
        });
      } catch (error) {
        console.error('[BOT EVENT] Erro no investir:', error.message);

        const isQuota = error.message && (error.message.includes('429') || error.message.includes('quota'));
        return bot.sendMessage(
          chatId,
          isQuota
            ? '⏳ O serviço de IA está sobrecarregado. Tente em alguns segundos.'
            : '❌ Ocorreu um erro. Tente novamente.',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Tentar novamente', callback_data: `investir_${valor}` }],
                [{ text: '🏠 Menu Principal', callback_data: 'cmd_menu' }],
              ],
            },
          }
        );
      } finally {
        processando.delete(userId);
      }
    }
  });

  // ==========================================
  // Qualquer mensagem de texto → mostrar menu
  // ==========================================
  bot.on('message', (msg) => {
    console.log('[BOT EVENT] Mensagem Genérica/Menu disparada por:', msg.from.id, 'Texto:', msg.text);
    // Registrar usuário automaticamente (em background)
    if (msg.from) {
      const pRegistrar = registrarUsuario(msg.from).catch(() => {});
      if (bot.pendingPromises) bot.pendingPromises.push(pRegistrar);
    }

    // Permitir /carteira com argumentos
    if (msg.text && msg.text.startsWith('/carteira ')) return;
    // Ignorar comandos já tratados
    if (msg.text && msg.text.startsWith('/')) return;

    if (msg.text) {
      const chatId = msg.chat.id;

      if (processando.has(msg.from.id)) {
        return bot.sendMessage(chatId, '⏳ Aguarde, ainda estou processando...');
      }

      return bot.sendMessage(
        chatId,
        '👆 Use os botões para navegar! Ou clique abaixo:',
        { reply_markup: MENU_PRINCIPAL }
      );
    }
  });

  // Tratamento de erros
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
