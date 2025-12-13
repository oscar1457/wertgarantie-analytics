import React from 'react';
import {
  LayoutDashboard,
  FileText,
  PieChart,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  Activity,
  Clock
} from 'lucide-react';
import { ViewState, Language } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  lang: Language;
  onReset: () => void;
}

const translations = {
  es: {
    overview: "Resumen",
    statistics: "Estadísticas",
    claims: "Siniestros",
    customers: "Clientes",
    analytics: "Análisis",
    history: "Historial",
    settings: "Configuración",
    logout: "Cerrar Sesión"
  },
  en: {
    overview: "Overview",
    statistics: "Statistics",
    claims: "Claims",
    customers: "Customers",
    analytics: "Analytics",
    history: "History",
    settings: "Settings",
    logout: "Logout"
  },
  de: {
    overview: "Übersicht",
    statistics: "Statistik",
    claims: "Schäden",
    customers: "Kunden",
    analytics: "Analyse",
    history: "Verlauf",
    settings: "Einstellungen",
    logout: "Abmelden"
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, lang, onReset }) => {
  const t = translations[lang];

  return (
    <div className="hidden md:flex flex-col w-20 lg:w-72 bg-white dark:bg-slate-900 h-screen border-r border-slate-100 dark:border-slate-800 sticky top-0 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-colors duration-300">
      <div className="flex items-center justify-center lg:justify-start h-24 px-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div className="ml-3 hidden lg:block">
            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight block leading-none">WERT</span>
            <span className="text-blue-600 font-bold text-sm tracking-widest">GARANTIE</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        <SidebarItem 
          icon={<LayoutDashboard size={22} />} 
          label={t.overview} 
          active={currentView === 'overview'} 
          onClick={() => onViewChange('overview')}
        />
        <SidebarItem 
          icon={<Activity size={22} />} 
          label={t.statistics} 
          active={currentView === 'statistics'}
          onClick={() => onViewChange('statistics')}
        />
        <SidebarItem 
          icon={<FileText size={22} />} 
          label={t.claims} 
          active={currentView === 'claims'}
          onClick={() => onViewChange('claims')}
        />
        <SidebarItem 
          icon={<Users size={22} />} 
          label={t.customers} 
          active={currentView === 'customers'}
          onClick={() => onViewChange('customers')}
        />
        <div className="my-6 border-t border-slate-100 dark:border-slate-800 mx-4"></div>
        <SidebarItem
          icon={<PieChart size={22} />}
          label={t.analytics}
          active={currentView === 'analytics'}
          onClick={() => onViewChange('analytics')}
        />
        <SidebarItem
          icon={<Clock size={22} />}
          label={t.history}
          active={currentView === 'history'}
          onClick={() => onViewChange('history')}
        />
        <SidebarItem
          icon={<Settings size={22} />}
          label={t.settings}
          active={currentView === 'settings'}
          onClick={() => onViewChange('settings')}
        />
      </nav>

      <div className="p-6">
        <button 
          onClick={onReset}
          className="flex items-center justify-center lg:justify-start w-full text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 p-4 rounded-2xl transition-all duration-200 group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="ml-3 hidden lg:block font-bold">{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center lg:justify-start w-full p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden ${active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>}
    <span className={`${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors`}>
      {icon}
    </span>
    <span className="ml-3 hidden lg:block font-bold text-sm tracking-wide">{label}</span>
  </button>
);
