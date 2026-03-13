import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';

const AdminLayout = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Navegação',
      items: [
        { 
          label: 'Visão Geral', 
          icon: 'pi pi-fw pi-home',
          command: () => { navigate('/'); setVisible(false); },
          className: location.pathname === '/' ? 'bg-blue-900 border-round' : ''
        },
        { 
          label: 'Configurações', 
          icon: 'pi pi-fw pi-cog',
          command: () => { navigate('/settings'); setVisible(false); },
          className: location.pathname === '/settings' ? 'bg-blue-900 border-round' : ''
        }
      ]
    },
    {
      label: 'Sessão',
      items: [
        { 
          label: 'Sair', 
          icon: 'pi pi-fw pi-power-off',
          command: () => handleLogout()
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-column">
      
      {/* Topbar moderna */}
      <div className="h-4rem bg-gray-800 border-bottom-1 border-gray-700 flex align-items-center justify-content-between px-4 sticky top-0 z-5">
        <div className="flex align-items-center gap-3">
          <Button 
            icon="pi pi-bars" 
            onClick={() => setVisible(true)} 
            text 
            rounded 
            aria-label="Menu" 
            className="text-white hover:bg-gray-700"
          />
          <div className="flex align-items-center gap-2">
            <i className="pi pi-chart-line text-blue-500 text-xl"></i>
            <span className="font-bold text-xl text-white tracking-wide">InvestAdmin</span>
          </div>
        </div>
        
        <div className="flex align-items-center gap-3">
          <div className="hidden sm:flex align-items-center gap-2 px-3 py-1 border-round-3xl bg-gray-700 border-1 border-gray-600">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-300">Bot Online</span>
          </div>
          <Avatar icon="pi pi-user" shape="circle" className="bg-blue-600 text-white" />
        </div>
      </div>

      {/* Sidebar deslizante via PrimeReact */}
      <Sidebar 
        visible={visible} 
        onHide={() => setVisible(false)} 
        className="bg-gray-900 border-right-1 border-gray-800"
      >
        <div className="flex flex-column h-full">
          <h2 className="text-white font-bold mb-5 pl-3">Menu Principal</h2>
          <Menu 
            model={menuItems} 
            className="w-full bg-transparent border-none text-white p-0" 
          />
          
          <div className="mt-auto border-top-1 border-gray-800 pt-4">
            <p className="text-gray-500 text-xs text-center">InvestBot Workspace<br/>Painel v2.0</p>
          </div>
        </div>
      </Sidebar>

      {/* Conteúdo Dinâmico (Dashboard, Configs) */}
      <div className="flex-1 p-4 md:p-6 pb-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
      
    </div>
  );
};

export default AdminLayout;
