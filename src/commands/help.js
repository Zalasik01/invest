const { HELP_MESSAGE } = require('../config');

function registrar(bot) {
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP_MESSAGE, { parse_mode: 'MarkdownV2' });
  });
}

module.exports = { registrar };
