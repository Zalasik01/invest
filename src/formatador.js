/**
 * Converte formatação Markdown da resposta do Gemini para HTML do Telegram.
 * Também converte emoji codes (:emoji:) para emojis Unicode reais.
 */

// Mapa de emoji codes para Unicode
const EMOJI_MAP = {
  ':bar_chart:': '📊',
  ':chart_with_upwards_trend:': '📈',
  ':chart_with_downwards_trend:': '📉',
  ':moneybag:': '💰',
  ':money_with_wings:': '💸',
  ':mag:': '🔍',
  ':mag_right:': '🔎',
  ':rocket:': '🚀',
  ':warning:': '⚠️',
  ':white_check_mark:': '✅',
  ':x:': '❌',
  ':bulb:': '💡',
  ':star:': '⭐',
  ':star2:': '🌟',
  ':fire:': '🔥',
  ':gem:': '💎',
  ':trophy:': '🏆',
  ':chart:': '📊',
  ':dollar:': '💵',
  ':heavy_check_mark:': '✅',
  ':exclamation:': '❗',
  ':question:': '❓',
  ':point_up:': '☝️',
  ':point_down:': '👇',
  ':point_right:': '👉',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':clap:': '👏',
  ':muscle:': '💪',
  ':eyes:': '👀',
  ':brain:': '🧠',
  ':calendar:': '📅',
  ':clock:': '⏰',
  ':lock:': '🔒',
  ':unlock:': '🔓',
  ':link:': '🔗',
  ':memo:': '📝',
  ':clipboard:': '📋',
  ':package:': '📦',
  ':bank:': '🏦',
  ':house:': '🏠',
  ':seedling:': '🌱',
  ':chart_increasing:': '📈',
  ':coin:': '🪙',
  ':credit_card:': '💳',
};

function formatarParaTelegram(texto) {
  let resultado = texto;

  // 1. Converter emoji codes para Unicode
  for (const [code, emoji] of Object.entries(EMOJI_MAP)) {
    resultado = resultado.replaceAll(code, emoji);
  }
  // Pegar qualquer emoji code restante não mapeado (remover os dois-pontos)
  resultado = resultado.replace(/:([a-z_]+):/g, (match, nome) => {
    return EMOJI_MAP[match] || match;
  });

  // 2. Converter Markdown para HTML

  // Converter **negrito** para <b>negrito</b>
  resultado = resultado.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  // Converter *itálico* para <i>itálico</i> (mas não confundir com listas)
  resultado = resultado.replace(/(?<!\n)\*(?!\s)(.+?)(?<!\s)\*/g, '<i>$1</i>');

  // Converter `código` para <code>código</code>
  resultado = resultado.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Converter ### título para <b>título</b>
  resultado = resultado.replace(/^#{1,3}\s+(.+)$/gm, '<b>$1</b>');

  // Converter listas com * para •
  resultado = resultado.replace(/^\*\s+/gm, '• ');

  // Converter listas com - para •
  resultado = resultado.replace(/^-\s+/gm, '• ');

  // Remover linhas --- (separadores)
  resultado = resultado.replace(/^-{3,}$/gm, '');

  // Limpar linhas em branco excessivas (max 2 seguidas)
  resultado = resultado.replace(/\n{4,}/g, '\n\n');

  return resultado.trim();
}

module.exports = { formatarParaTelegram };
