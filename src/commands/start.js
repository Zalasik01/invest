const { WELCOME_MESSAGE } = require('../config');

function registrar(bot) {
  bot.onText(/\/start/, (msg) => {
    return bot.sendMessage(msg.chat.id, WELCOME_MESSAGE, {
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
    });
  });
}

module.exports = { registrar };
