module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { matricula } = req.body;
  const ADMIN_MATRICULA = process.env.ADMIN_MATRICULA || 'invest2026';

  if (matricula === ADMIN_MATRICULA) {
    return res.status(200).json({ success: true, token: matricula });
  }

  return res.status(401).json({ success: false, message: 'Matrícula inválida' });
};
