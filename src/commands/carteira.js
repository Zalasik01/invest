const { salvarCarteira, buscarCarteira } = require('../database');

function registrar(bot) {
  bot.onText(/\/carteira(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const argumentos = match[1];

    if (!argumentos) {
      // Mostrar carteira atual
      const carteira = buscarCarteira(userId);

      if (!carteira || carteira.length === 0) {
        bot.sendMessage(
          chatId,
          '📂 Você ainda não salvou sua carteira\\.\n\n_Use: /carteira MXRF11 11, PETR3 2, ITUB4 1_',
          { parse_mode: 'MarkdownV2' }
        );
        return;
      }

      let mensagem = '💼 *Sua Carteira Atual:*\n\n';
      carteira.forEach((ativo, i) => {
        mensagem += `${i + 1}\\. *${ativo.codigo}* \\- ${ativo.quantidade} cota${ativo.quantidade > 1 ? 's' : ''}\n`;
      });
      mensagem += '\n_Para atualizar, use: /carteira MXRF11 11, PETR3 2_';

      bot.sendMessage(chatId, mensagem, { parse_mode: 'MarkdownV2' });
      return;
    }

    // Salvar carteira - formato: MXRF11 11, PETR3 2, ITUB4 1
    try {
      const ativos = argumentos.split(',').map((item) => {
        const partes = item.trim().split(/\s+/);
        if (partes.length < 2) {
          throw new Error(`Formato inválido: "${item.trim()}"`);
        }
        const codigo = partes[0].toUpperCase();
        const quantidade = parseInt(partes[1]);
        if (isNaN(quantidade) || quantidade <= 0) {
          throw new Error(`Quantidade inválida para ${codigo}`);
        }
        return { codigo, quantidade };
      });

      salvarCarteira(userId, ativos);

      let mensagem = '✅ *Carteira salva com sucesso\\!*\n\n';
      ativos.forEach((ativo, i) => {
        mensagem += `${i + 1}\\. *${ativo.codigo}* \\- ${ativo.quantidade} cota${ativo.quantidade > 1 ? 's' : ''}\n`;
      });
      mensagem +=
        '\n_Agora suas recomendações levarão sua carteira em conta\\!_ 🎯';

      bot.sendMessage(chatId, mensagem, { parse_mode: 'MarkdownV2' });
    } catch (error) {
      bot.sendMessage(
        chatId,
        '⚠️ Formato inválido\\. Use assim:\n\n/carteira MXRF11 11, PETR3 2, ITUB4 1\n\n_Código e quantidade separados por espaço, ativos separados por vírgula\\._',
        { parse_mode: 'MarkdownV2' }
      );
    }
  });
}

module.exports = { registrar };
