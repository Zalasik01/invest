const { buscarEstatisticasAdmin, buscarUltimosUsuariosAdmin } = require('../src/database');

module.exports = async function handler(req, res) {
  // Pegar senha da query (?admin=senha)
  const adminQuery = req.query.admin;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'invest2026'; // fallback se não tiver dotenv local

  // Se não for admin, mostra a página padrão
  if (adminQuery !== ADMIN_PASSWORD) {
    return res.status(200).send(`
      <html>
        <head>
          <title>InvestBot - Status</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc; }
            .container { background: #1e293b; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: inline-block; }
            h1 { color: #38bdf8; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 InvestBot</h1>
            <p>O servidor do bot está <strong>ONLINE</strong>.</p>
            <p style="color: #94a3b8; font-size: 0.9em; margin-top: 20px;">Webhook escutando mensagens 🚀</p>
          </div>
        </body>
      </html>
    `);
  }

  // Se chegou aqui, a senha tá certa! Renderiza o Dashboard
  try {
    const stats = await buscarEstatisticasAdmin();
    const ultimos = await buscarUltimosUsuariosAdmin(10);

    const formatarData = (isoStr) => {
      if (!isoStr) return '-';
      return new Date(isoStr).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    };

    const userRows = ultimos.map(u => \`
      <tr class="border-b border-gray-700 hover:bg-gray-750 transition-colors">
        <td class="px-4 py-3 font-medium text-white">\${u.nome || 'Anônimo'}</td>
        <td class="px-4 py-3 text-gray-400">\${u.username ? '@' + u.username : '-'}</td>
        <td class="px-4 py-3 text-gray-400">\${formatarData(u.ultimo_acesso)}</td>
      </tr>
    \`).join('');

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="pt-BR" class="dark">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InvestBot | Admin Painel</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: { gray: { 750: '#2d3748', 850: '#1a202c', 950: '#0d1117' } }
              }
            }
          }
        </script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>body { font-family: 'Inter', sans-serif; }</style>
      </head>
      <body class="bg-gray-950 text-gray-100 min-h-screen">
        <!-- Topbar -->
        <header class="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-lg">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-blue-600 rounded-lg p-1.5 flex items-center justify-center h-8 w-8">
                <span class="text-white text-lg">📈</span>
              </div>
              <h1 class="font-bold text-xl tracking-tight">InvestBot Admin</h1>
            </div>
            <div class="flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span class="text-sm font-medium text-gray-300">Sistema Online</span>
            </div>
          </div>
        </header>

        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-white">Visão Geral</h2>
            <p class="text-gray-400 mt-1">Estatísticas em tempo real do banco de dados.</p>
          </div>

          <!-- Cards de Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <!-- Usuários -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">👥</div>
              <p class="text-sm font-medium text-gray-400 mb-1">Total de Usuários</p>
              <p class="text-4xl font-bold text-white">\${stats.usuarios}</p>
              <div class="mt-4 flex items-center text-xs text-blue-400 font-medium">
                <span>Cadastrados no bot</span>
              </div>
            </div>

            <!-- Interações -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">💬</div>
              <p class="text-sm font-medium text-gray-400 mb-1">Total de Interações</p>
              <p class="text-4xl font-bold text-white">\${stats.mensagens}</p>
              <div class="mt-4 flex items-center text-xs text-purple-400 font-medium">
                <span>Mensagens processadas</span>
              </div>
            </div>

            <!-- Carteiras -->
            <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm relative overflow-hidden group">
              <div class="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:scale-110 transition-transform">💼</div>
              <p class="text-sm font-medium text-gray-400 mb-1">Carteiras Salvas</p>
              <p class="text-4xl font-bold text-white">\${stats.carteiras}</p>
              <div class="mt-4 flex items-center text-xs text-green-400 font-medium">
                <span>Usuários com ativos</span>
              </div>
            </div>
          </div>

          <!-- Tabela de Usuários Recentes -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-white">Últimos Usuários Ativos</h2>
              <span class="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">Top 10</span>
            </div>
            
            <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-sm">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-850 border-b border-gray-700 text-sm">
                      <th class="px-4 py-3 font-semibold text-gray-300">Nome</th>
                      <th class="px-4 py-3 font-semibold text-gray-300">Username (@)</th>
                      <th class="px-4 py-3 font-semibold text-gray-300">Último Acesso</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm divide-y divide-gray-800">
                    \${userRows}
                    \${ultimos.length === 0 ? '<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>' : ''}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Erro no admin:', error);
    res.status(500).send('Erro ao carregar o painel administrativo: ' + error.message);
  }
};

