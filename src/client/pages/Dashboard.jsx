import React, { useEffect, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

const Dashboard = () => {
  const [stats, setStats] = useState({ usuarios: 0, mensagens: 0, carteiras: 0 });
  const [ultimos, setUltimos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fuso horário de Brasília
  const timeZone = 'America/Sao_Paulo';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if (data.success) {
          setStats(data.stats);
          setUltimos(data.ultimos);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatarData = (dateString) => {
    if (!dateString) return '-';
    try {
      return formatInTimeZone(new Date(dateString), timeZone, 'dd/MM/yyyy HH:mm:ss');
    } catch {
      return '-';
    }
  };

  return (
    <div className="animate-fade-in font-sans">
      
      {/* Header Sec */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Painel de Acompanhamento</h1>
        <p className="text-slate-400 mt-2">Métricas e performance extraídas do banco de dados.</p>
      </div>

      {/* Cards de Big Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-slate-800 border-slate-700/50 border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 text-9xl leading-none opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            👥
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Usuários Totais</h3>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {loading ? <span className="animate-pulse bg-slate-700 text-transparent rounded">0000</span> : stats.usuarios}
          </div>
          <p className="text-sm text-slate-500 mt-2">Registrados permanentemente</p>
        </div>
        
        <div className="bg-slate-800 border-slate-700/50 border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 text-9xl leading-none opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            💬
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Interações com IA</h3>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {loading ? <span className="animate-pulse bg-slate-700 text-transparent rounded">0000</span> : stats.mensagens}
          </div>
          <p className="text-sm text-slate-500 mt-2">Mensagens da OpenAI/Gemini</p>
        </div>

        <div className="bg-slate-800 border-slate-700/50 border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 text-9xl leading-none opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none">
            💼
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Carteiras Salvas</h3>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight">
            {loading ? <span className="animate-pulse bg-slate-700 text-transparent rounded">0000</span> : stats.carteiras}
          </div>
          <p className="text-sm text-slate-500 mt-2">Relatórios mantidos seguros</p>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Última Atividade da Plataforma</h2>
      
      <div className="bg-slate-800 border-slate-700/50 border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6 font-semibold">Identificação</th>
                <th className="py-4 px-6 font-semibold">Telegram User</th>
                <th className="py-4 px-6 font-semibold">Horário Local (BR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              
              {loading ? (
                // Skeleton Rows
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-700 rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                  </tr>
                ))
              ) : ultimos.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-500">Nenhum registro no momento.</td>
                </tr>
              ) : (
                ultimos.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-200">{u.nome || <span className="text-slate-500 italic">Desconhecido</span>}</span>
                    </td>
                    <td className="py-4 px-6">
                      {u.username 
                        ? <span className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md text-sm font-medium">@{u.username}</span> 
                        : <span className="text-slate-600">-</span>
                      }
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {formatarData(u.ultimo_acesso)}
                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
