const TelegramBot = require('node-telegram-bot-api');
const { chat } = require('./gemini');
const { enviarRespostaLonga, mostrarBotoesDeValor, processarInvestimento } = require('./commands/investir');
const { buscarCarteira } = require('./database');
const { HELP_MESSAGE } = require('./config');

// Importar comandos
const startCmd = require('./commands/start');
const investirCmd = require('./commands/investir');
const carteiraCmd = require('./commands/carteira');
const helpCmd = require('./commands/help');

// Controle de usuários que estão com processamento em andamento
const processando = new Set();

function criarBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token === 'seu_token_aqui') {
    console.error('❌ TELEGRAM_BOT_TOKEN não definido no .env');
    process.exit(1);
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log('🤖 InvestBot iniciando...');

  // Registrar comandos
  startCmd.registrar(bot);
  investirCmd.registrar(bot);
  carteiraCmd.registrar(bot);
  helpCmd.registrar(bot);

  // ==========================================
  // Handler de botões inline (callback_query)
  // ==========================================
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const messageId = query.message.message_id;
    const data = query.data;

    // Se já está processando, ignorar cliques
    if (processando.has(userId)) {
      bot.answerCallbackQuery(query.id, {
        text: '⏳ Aguarde, ainda estou processando sua solicitação...',
        show_alert: false,
      });
      return;
    }

    // Confirmar clique
    bot.answerCallbackQuery(query.id);

    // --- Botões de menu ---
    if (data === 'menu_investir') {
      // Substituir a mensagem anterior pelos botões de valor
      bot.editMessageText(
        '💰 <b>Quanto deseja investir?</b>\n\nEscolha um valor abaixo:',
        {
          chat_id: chatId,
          message_id: messageId,
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
                { text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' },
              ],
            ],
          },
        }
      );
      return;
    }

    if (data === 'cmd_carteira') {
      const carteira = buscarCarteira(userId);

      if (!carteira || carteira.length === 0) {
        bot.editMessageText(
          '📂 Você ainda não salvou sua carteira.\n\nEnvie no chat:\n<code>/carteira MXRF11 11, PETR3 2, ITUB4 1</code>',
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' }],
              ],
            },
          }
        );
      } else {
        let mensagem = '💼 <b>Sua Carteira Atual:</b>\n\n';
        carteira.forEach((ativo, i) => {
          mensagem += `${i + 1}. <b>${ativo.codigo}</b> — ${ativo.quantidade} cota${ativo.quantidade > 1 ? 's' : ''}\n`;
        });
        mensagem += '\nPara atualizar, envie no chat:\n<code>/carteira MXRF11 11, PETR3 2</code>';
        bot.editMessageText(mensagem, {
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
      return;
    }

    if (data === 'cmd_help') {
      bot.editMessageText(HELP_MESSAGE, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Voltar ao menu', callback_data: 'cmd_menu' }],
          ],
        },
      });
      return;
    }

    if (data === 'cmd_menu') {
      bot.editMessageText(
        '🤖 <b>InvestBot</b> — O que deseja fazer?',
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💰 Investir', callback_data: 'menu_investir' },
                { text: '💼 Minha Carteira', callback_data: 'cmd_carteira' },
              ],
              [
                { text: '❓ Ajuda', callback_data: 'cmd_help' },
              ],
            ],
          },
        }
      );
      return;
    }

    // --- Botões de investimento ---
    if (data.startsWith('investir_')) {
      const valor = parseFloat(data.replace('investir_', ''));
      if (!isNaN(valor) && valor > 0) {
        // Mostrar loading — editar mensagem atual
        processando.add(userId);

        bot.editMessageText(
          `⏳ <b>Analisando o mercado para R$ ${valor.toFixed(2)}...</b>\n\n🔄 Isso pode levar alguns segundos.`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
          }
        );

        bot.sendChatAction(chatId, 'typing');

        try {
          const prompt = `Tenho R$ ${valor.toFixed(2)} para investir hoje. Me dê uma recomendação completa seguindo a estrutura obrigatória (Análise de Momento, Recomendação de Alocação, Ativos Selecionados, Estimativa de Retorno).`;

          const resposta = await chat(userId, prompt);
          await enviarRespostaLonga(bot, chatId, resposta);

          // Mostrar menu após resposta
          bot.sendMessage(chatId, '👇 O que deseja fazer agora?', {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '💰 Investir outro valor', callback_data: 'menu_investir' },
                  { text: '💼 Minha Carteira', callback_data: 'cmd_carteira' },
                ],
                [
                  { text: '🏠 Menu Principal', callback_data: 'cmd_menu' },
                ],
              ],
            },
          });
        } catch (error) {
          console.error('Erro no investir:', error.message);

          const isQuota = error.message && (error.message.includes('429') || error.message.includes('quota'));
          const mensagemErro = isQuota
            ? '⏳ O serviço de IA está temporariamente sobrecarregado.'
            : '❌ Ocorreu um erro ao processar sua solicitação.';

          bot.sendMessage(chatId, mensagemErro, {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Tentar novamente', callback_data: `investir_${valor}` }],
                [{ text: '🏠 Menu Principal', callback_data: 'cmd_menu' }],
              ],
            },
          });
        } finally {
          processando.delete(userId);
        }
      }
      return;
    }
  });

  // Handler de mensagens de texto — redirecionar para botões
  bot.on('message', (msg) => {
    // Permitir o comando /carteira com argumentos (para salvar carteira)
    if (msg.text && msg.text.startsWith('/carteira ')) return;

    // Ignorar outros comandos (já tratados)
    if (msg.text && msg.text.startsWith('/')) return;

    // Bloquear texto livre — orientar para usar botões
    if (msg.text) {
      const chatId = msg.chat.id;

      if (processando.has(msg.from.id)) {
        bot.sendMessage(chatId, '⏳ Aguarde, ainda estou processando sua solicitação anterior...');
        return;
      }

      bot.sendMessage(
        chatId,
        '👆 Use os botões acima para interagir comigo!\n\nOu envie /start para abrir o menu.',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💰 Investir', callback_data: 'menu_investir' },
                { text: '💼 Minha Carteira', callback_data: 'cmd_carteira' },
              ],
              [
                { text: '❓ Ajuda', callback_data: 'cmd_help' },
              ],
            ],
          },
        }
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
