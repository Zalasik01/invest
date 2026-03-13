import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

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
      // Chamada para a Vercel/Express Backend API que vamos criar
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        dispatch(login(matricula));
        navigate('/'); // Vai pro dashboard
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
    <div className="flex align-items-center justify-content-center min-vh-100 bg-gray-900 w-full min-h-screen">
      <div className="w-full max-w-md p-4">
        
        <div className="text-center mb-5">
          <div className="inline-flex align-items-center justify-content-center bg-blue-600 border-round p-3 mb-3">
            <i className="pi pi-chart-line text-white text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white m-0">InvestBot Admin</h1>
          <p className="text-gray-400 mt-2">Acesso Restrito</p>
        </div>

        <Card className="shadow-6 border-round-xl border-1 border-gray-800 bg-gray-900 w-full">
          <form onSubmit={handleLogin} className="flex flex-column gap-4">
            
            {errorMsg && <Message severity="error" text={errorMsg} />}

            <div className="flex flex-column gap-2">
              <label htmlFor="matricula" className="text-gray-300 font-medium">Sua Matrícula (Senha)</label>
              <Password 
                id="matricula" 
                value={matricula} 
                onChange={(e) => setMatricula(e.target.value)} 
                feedback={false} 
                toggleMask
                className="w-full"
                inputClassName="w-full bg-gray-800 border-gray-700 text-white"
                placeholder="Insira a matrícula de administrador"
              />
            </div>

            <Button 
              label={loading ? 'Verificando...' : 'Acessar Painel'} 
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
              loading={loading}
              type="submit"
              className="mt-2 w-full"
              disabled={!matricula}
            />
          </form>
        </Card>
        
        <p className="text-center text-gray-500 text-sm mt-5">
          Ambiente restrito apenas para administração.
        </p>

      </div>
    </div>
  );
};

export default Login;
