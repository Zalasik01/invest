import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';

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
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // States Identidade Bot
  const [botName, setBotName] = useState('');
  const [botDesc, setBotDesc] = useState('');
  const [avatarObj, setAvatarObj] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const inputAvatar = useRef(null);

  // Redux (Matrícula Guardada)
  const matriculaAtual = useSelector((state) => state.auth.matricula);

  // Lidar com Seleção de Imagem Local
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limite safety
         setErrorMsg("Imagem muito pesada (Max 2MB).");
         return;
      }
      setAvatarObj(file);
      
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const converterBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSaveIdentity = async (e) => {
    e.preventDefault();
    if (!botName && !botDesc && !avatarObj) return;

    setLoading(true);
    setSavedMessage('');
    setErrorMsg('');

    try {
      let coverStr = null;
      if (avatarObj) coverStr = await converterBase64(avatarObj);

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula: matriculaAtual,
          name: botName || undefined,
          description: botDesc || undefined,
          avatarBase64: coverStr,
        })
      });

      const data = await res.json();
      
      if (data.success) {
         let info = 'Identidade atualizada.';
         if (data.results.name) info += ' Nome alterado!';
         if (data.results.description) info += ' Sobrebot alterado!';
         if (avatarObj) info += ' (Atenção: Uploads de Avatares são feitos na Supabase Storage, a Foto do Perfil oficial do telegram requer o @BotFather).';
         
         setSavedMessage(info);
         setBotName(''); setBotDesc('');
         setAvatarObj(null); setAvatarPreview(null);
         setTimeout(() => setSavedMessage(''), 8000);
      } else {
         setErrorMsg(data.error || 'Autenticação Vercel falhou.');
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Falha de conexão S-Node ao configurar Bot.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-fade-in font-sans max-w-4xl pb-10">
      
      {/* Toast Notificações */}
      {savedMessage && (
        <div className="fixed top-20 right-8 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl shadow-lg flex items-start gap-3 animate-slide-in max-w-sm z-50 backdrop-blur-md">
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="font-medium text-sm leading-relaxed">{savedMessage}</span>
        </div>
      )}
      
      {errorMsg && (
        <div className="fixed top-20 right-8 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in z-50">
           <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <span className="font-medium text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Título Principal */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Parâmetros do Sistema</h1>
        <p className="text-slate-400 mt-2">Personalize a identidade do Bot e o seu comportamento restrito.</p>
      </div>


      {/* Bloco 1: Identidade Visual e Bio (NOVO) */}
      <div className="bg-slate-800 border-slate-700/50 border rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center gap-3">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <h2 className="text-lg font-semibold text-white">Identidade no Telegram</h2>
        </div>
        
        <form onSubmit={handleSaveIdentity} className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Coluna 1: Avatar Upload */}
              <div className="col-span-1 flex flex-col items-center justify-start gap-3">
                 <div 
                   className="w-32 h-32 rounded-full border-2 border-dashed border-slate-600 bg-slate-900/50 relative group cursor-pointer overflow-hidden shadow-inner flex shrink-0 items-center justify-center hover:border-blue-500 transition-colors"
                   onClick={() => inputAvatar.current?.click()}
                 >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-medium text-white">
                       Elegir Mídia
                    </div>
                 </div>
                 <input type="file" ref={inputAvatar} onChange={handleImageChange} accept="image/jpeg, image/png" className="hidden" />
                 <p className="text-xs text-slate-500 text-center px-2">Salva o Backup visual no seu Supabase Storage</p>
              </div>

              {/* Coluna 2: Forms Textuais */}
              <div className="col-span-1 md:col-span-3 space-y-5">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nova Alcunha (Nome do Bot)</label>
                    <input 
                      type="text" 
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="Ex: Assessor Invest IA"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Resumo da Descrição (Aparece ao abrir o chat)</label>
                    <textarea 
                      value={botDesc}
                      onChange={(e) => setBotDesc(e.target.value)}
                      placeholder="Olá, sou seu assistente pessoal focado em Renda Fixa..."
                      rows="3"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm resize-none"
                    ></textarea>
                 </div>

                 <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || (!botName && !botDesc && !avatarObj)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      )}
                      Atualizar via Telegram API
                    </button>
                 </div>
              </div>
           </div>
        </form>
      </div>


      {/* Bloco 2: Manutenção (Legado) */}
      <div className="bg-slate-800 border-slate-700/50 border rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-white">Comportamento Geral (Restrições)</h2>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-700/50">
            <div className="pr-12">
              <h3 className="text-white font-medium mb-1">Modo de Manutenção</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bloqueia requisições públicas do Telegram Webhook para usuários. Temporário.
              </p>
            </div>
            <div>
              <Toggle active={maintenanceMod} onChange={setMaintenanceMod} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
