import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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

  const formatarData = (rowData) => {
    if (!rowData.ultimo_acesso) return '-';
    try {
      // Força a data UTC do Supabase a renderizar o texto como Horário de Brasília
      return formatInTimeZone(new Date(rowData.ultimo_acesso), timeZone, 'dd/MM/yyyy HH:mm:ss');
    } catch {
      return '-';
    }
  };

  const nameTemplate = (rowData) => rowData.nome || <span className="text-gray-500 italic">Anônimo</span>;
  const usernameTemplate = (rowData) => rowData.username ? <span className="text-blue-400">@{rowData.username}</span> : '-';

  return (
    <div className="fadein animation-duration-500">
      
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white m-0">Visão Geral</h1>
        <p className="text-gray-400 mt-1">Estatísticas do banco em tempo real.</p>
      </div>

      <div className="grid">
        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round-xl bg-gray-900 border-1 border-gray-800 text-white relative overflow-hidden h-full">
            <div className="absolute opacity-10" style={{ right: '-1rem', top: '-1rem', fontSize: '6rem' }}>👥</div>
            <div className="text-blue-400 font-medium mb-2">Total de Usuários</div>
            <div className="text-5xl font-bold">{loading ? '...' : stats.usuarios}</div>
            <div className="text-gray-500 text-sm mt-3">Cadastrados no bot</div>
          </Card>
        </div>
        
        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round-xl bg-gray-900 border-1 border-gray-800 text-white relative overflow-hidden h-full">
            <div className="absolute opacity-10" style={{ right: '-1rem', top: '-1rem', fontSize: '6rem' }}>💬</div>
            <div className="text-purple-400 font-medium mb-2">Interações Processadas</div>
            <div className="text-5xl font-bold">{loading ? '...' : stats.mensagens}</div>
            <div className="text-gray-500 text-sm mt-3">Mensagens trafegadas</div>
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round-xl bg-gray-900 border-1 border-gray-800 text-white relative overflow-hidden h-full">
            <div className="absolute opacity-10" style={{ right: '-1rem', top: '-1rem', fontSize: '6rem' }}>💼</div>
            <div className="text-green-400 font-medium mb-2">Carteiras Salvas</div>
            <div className="text-5xl font-bold">{loading ? '...' : stats.carteiras}</div>
            <div className="text-gray-500 text-sm mt-3">Usuários utilizando gerenciamento</div>
          </Card>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-bold text-white mb-3">Últimas Atividades</h2>
        <Card className="p-0 border-round-xl bg-gray-900 border-1 border-gray-800 overflow-hidden">
          <DataTable 
            value={ultimos} 
            loading={loading} 
            responsiveLayout="scroll"
            emptyMessage="Nenhum usuário encontrado."
            // Customizar temas do Prime interno da DataTable
            className="p-datatable-sm bg-transparent"
            rowHover
            stripedRows
          >
            <Column header="Nome" body={nameTemplate} className="text-white border-bottom-1 border-gray-800" headerClassName="bg-gray-800 text-gray-300 border-none" />
            <Column header="Username (@)" body={usernameTemplate} className="border-bottom-1 border-gray-800" headerClassName="bg-gray-800 text-gray-300 border-none" />
            <Column header="Último Acesso (Brasília)" body={formatarData} className="text-gray-400 border-bottom-1 border-gray-800" headerClassName="bg-gray-800 text-gray-300 border-none" />
          </DataTable>
        </Card>
      </div>

    </div>
  );
};

export default Dashboard;
