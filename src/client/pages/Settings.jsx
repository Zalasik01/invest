import React, { useState } from 'react';

// Pequeno componente Custom Switch pro Tailwind
const Toggle = ({ active, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!active)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
      active ? 'bg-blue-600' : 'bg-slate-700'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        active ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const Settings = () => {
  const [maintenanceMod, setMaintenanceMod] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setSaved(false);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // esconde alerta de sucesso
    }, 800);
  };

  return (
    <div className="animate-fade-in font-sans max-w-4xl">
      
      {/* Mensagem Toast Flutuante (Feita manual c/ tw) */}
      {saved && (
        <div className="fixed top-20 right-8 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          <span className="font-medium">Configurações Atualizadas com Sucesso!</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Parâmetros do Sistema</h1>
        <p className="text-slate-400 mt-2">Visão e controle sob o comportamento da aplicação em produção.</p>
      </div>

      <div className="bg-slate-800 border-slate-700/50 border rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">Comportamento Geral</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
            <div className="pr-12">
              <h3 className="text-white font-medium mb-1">Modo de Manutenção (Restrito)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bloqueia as requisições dos usuários comuns que chegam via Telegram Webhook. 
                Os administradores manterão o acesso ao painel via Matrícula durante esse período.
              </p>
            </div>
            <div>
              <Toggle active={maintenanceMod} onChange={setMaintenanceMod} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              )}
              {loading ? 'Processando...' : 'Aplicar Modificações'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border-slate-700/50 border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">Infraestrutura Externa</h2>
        </div>
        
        <div className="p-6">
          <div className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-4 rounded-xl text-sm mb-6 flex gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="leading-relaxed">
              Variáveis críticas (ex: API Keys da OpenAI, Supabase e Telegram) não devem ser renderizadas no painel web. Configure sua infraestrutura de Deploy (Vercel) para modificá-las isoladamente. 
            </p>
          </div>

          <div className="space-y-4 text-sm">
             <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                <span className="text-slate-400 font-medium">Conexão do Banco (Supabase)</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Conectado 
                </span>
             </div>
             
             <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                <span className="text-slate-400 font-medium">Parse Timezone Interno</span>
                <span className="text-blue-400 font-mono bg-blue-400/10 px-3 py-1 rounded-md">
                  America/Sao_Paulo (UTC-3)
                </span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
