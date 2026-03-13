import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';

const Login = () => {
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!matricula) return;
    
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        dispatch(login(matricula));
        navigate('/'); 
      } else {
        setErrorMsg('Matrícula Inválida ou Recusada.');
      }
    } catch (err) {
      setErrorMsg('Erro de Comunicação com o Servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-vh-100 bg-slate-900 w-full min-h-screen font-sans">
      <div className="w-full max-w-sm px-4">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-2xl p-4 mb-4 shadow-lg shadow-blue-500/20">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">InvestBot Admin</h1>
          <p className="text-slate-400 mt-2 text-sm">Controle e Gerenciamento</p>
        </div>

        <div className="bg-slate-800 border-slate-700/50 border rounded-2xl shadow-xl p-6 md:p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="matricula" className="text-slate-300 text-sm font-medium">Matrícula de Acesso</label>
              <input
                type="password"
                id="matricula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Insira sua senha/matrícula"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!matricula || loading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8">
          Acesso restrito a administradores autorizados.
        </p>

      </div>
    </div>
  );
};

export default Login;
