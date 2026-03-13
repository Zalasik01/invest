const { buscarEstatisticasAdmin, buscarUltimosUsuariosAdmin } = require('../src/database');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Futuro: Validar o 'Authorization' header aqui para bloquear chamadas externas se desejar

  try {
    const stats = await buscarEstatisticasAdmin();
    const ultimos = await buscarUltimosUsuariosAdmin(10);
    
    return res.status(200).json({ success: true, stats, ultimos });
  } catch (error) {
    console.error('Erro na API stats:', error);
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }
};
