import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

const Settings = () => {
  const [maintenanceMod, setMaintenanceMod] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  // Simulando carregamento das configurações do backend
  useEffect(() => {
    // Exemplo: buscar cfg do BD depois
  }, []);

  const handleSave = () => {
    setLoading(true);
    // Simular API delay
    setTimeout(() => {
      setLoading(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Configurações atualizadas' });
    }, 800);
  };

  return (
    <div className="fadein animation-duration-500">
      <Toast ref={toast} />
      
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white m-0">Configurações</h1>
        <p className="text-gray-400 mt-1">Gerencie chaves e o estado do sistema.</p>
      </div>

      <div className="grid">
        <div className="col-12 md:col-6">
          <Card title="Geral do Bot" className="shadow-2 border-round-xl bg-gray-900 border-1 border-gray-800 text-white mb-4">
            
            <div className="flex align-items-center justify-content-between py-3 border-bottom-1 border-gray-800">
              <div>
                <h3 className="m-0 font-medium text-lg">Modo de Manutenção</h3>
                <p className="m-0 text-sm text-gray-400 mt-1">Bloqueia usuários comuns de conversarem com o bot.</p>
              </div>
              <InputSwitch checked={maintenanceMod} onChange={(e) => setMaintenanceMod(e.value)} />
            </div>

            <div className="mt-4 flex justify-content-end">
              <Button label="Salvar Alterações" icon="pi pi-save" loading={loading} onClick={handleSave} className="p-button-primary" />
            </div>
            
          </Card>
        </div>

        <div className="col-12 md:col-6">
          <Card title="Sistema e APIs" className="shadow-2 border-round-xl bg-gray-900 border-1 border-gray-800 text-white">
            <p className="text-gray-400 m-0 line-height-3 text-sm">
              As variáveis secretas como <code>TELEGRAM_BOT_TOKEN</code> e <code>GEMINI_API_KEY</code> devem ser configuradas exclusivamente via Painel da Vercel (Environment Variables) por questões de segurança.
            </p>
            <div className="mt-4 p-3 bg-gray-800 border-round text-sm">
              <div className="flex align-items-center justify-content-between mb-2">
                <span className="text-gray-400">Banco de Dados</span>
                <span className="text-green-400"><i className="pi pi-check-circle mr-1"></i>Supabase Integrado</span>
              </div>
              <div className="flex align-items-center justify-content-between">
                <span className="text-gray-400">Fuso Horário Relatórios</span>
                <span className="text-blue-400 pl-4 text-right">América / São Paulo (GMT-3)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
