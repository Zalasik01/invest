const { WELCOME_MESSAGE } = require('../config');

function registrar(bot) {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, WELCOME_MESSAGE, { parse_mode: 'MarkdownV2' });
  });
}

module.exports = { registrar };
