import { useState, ReactNode } from 'react';
import { useRouter } from '../utils/router';
import { 
  LayoutDashboard, 
  Users, 
  FileBarChart, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Church, 
  UserCheck,
  ChevronRight,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'visitantes' | 'relatorios' | 'configuracoes';
}

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const { user, logoutUser, navigate } = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed ("fechado") as requested by the user

  // Load Church configurations from LocalStorage
  const churchConfig = (() => {
    try {
      const stored = localStorage.getItem('conecta_configuracao');
      return stored ? JSON.parse(stored) : { nome: 'Conecta Igreja', logo_url: '' };
    } catch {
      return { nome: 'Conecta Igreja', logo_url: '' };
    }
  })();

  const menuItems = [
    { id: 'dashboard', nome: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'visitantes', nome: 'Visitantes', icon: Users, path: '/admin/visitantes' },
    { id: 'relatorios', nome: 'Relatórios', icon: FileBarChart, path: '/admin/relatorios' },
    { id: 'configuracoes', nome: 'Configurações', icon: Settings, path: '/admin/configuracoes' },
  ];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-gradient-to-br from-[#0c1015] via-[#070b0e] to-[#010203] text-white flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Decorative ambient lights with beautiful deep slate / charcoal hues */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1015]/90 via-[#070b0e]/95 to-[#010203] pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#101419] rounded-full filter blur-[150px] opacity-[0.40] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#040608] rounded-full filter blur-[150px] opacity-[0.30] pointer-events-none"></div>
      
      {/* 1. Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col h-screen bg-[#05080c]/90 backdrop-blur-3xl border-r border-white/[0.05] p-5 shrink-0 justify-between sticky top-0 z-30 transition-all duration-300 shadow-[10px_0_40px_-15px_rgba(0,0,0,0.85),4px_0_15px_rgba(59,130,246,0.02)] animate-fade-in relative ${isCollapsed ? 'w-[88px]' : 'w-72'}`}>
        
        {/* Toggle Collapse Button sits beautifully on the right boundary */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-8 -right-3.5 w-7 h-7 rounded-full bg-[#090e14] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer z-50 group"
          title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isCollapsed ? (
            <ChevronRight size={13} className="text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          ) : (
            <ChevronLeft size={13} className="text-slate-400 group-hover:text-blue-400 group-hover:-translate-x-0.5 transition-all" />
          )}
        </button>

        <div className="flex flex-col gap-8">
          
          {/* Logo / Title Block */}
          <div className={`flex items-center gap-3.5 py-3 border-b border-white/5 overflow-hidden transition-all duration-300 ${isCollapsed ? 'justify-center border-none' : 'justify-start'}`}>
            {churchConfig.logo_url ? (
               <img 
                 src={churchConfig.logo_url} 
                 alt="Logo da Igreja" 
                 className="w-10 h-10 object-contain rounded-xl border border-white/10 shadow-lg shadow-black/40 shrink-0"
                 referrerPolicy="no-referrer"
               />
             ) : (
               <div id="sidebar-logo-fallback" className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 shrink-0">
                 <Church size={20} />
               </div>
             )}
            
            {!isCollapsed && (
              <div className="flex flex-col justify-center animate-fade-in whitespace-nowrap">
                <h1 className="text-sm font-bold tracking-wider leading-none uppercase text-white font-heading truncate max-w-[170px]">
                  {churchConfig.nome}
                </h1>
                <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase mt-1">Conecta Igreja</span>
              </div>
            )}
          </div>
 
          {/* Navigation Links */}
          <nav className={`flex flex-col gap-2.5 ${isCollapsed ? 'items-center' : 'items-stretch'}`}>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  id={`sidebar-link-${item.id}`}
                  className={`flex items-center rounded-xl text-xs uppercase tracking-wider font-bold transition-all duration-300 group cursor-pointer relative ${
                    isCollapsed 
                      ? 'w-12 h-12 justify-center' 
                      : 'w-full gap-3.5 px-4.5 py-3.5'
                  } ${
                    isActive
                      ? 'bg-blue-600/10 text-white border border-blue-550/20 shadow-[0_8px_30px_rgb(59,130,246,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  {/* Active highlight bar */}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 bg-gradient-to-b from-blue-500 to-sky-405" />
                  )}
                  
                  <IconComp 
                    size={16} 
                    className={`transition-all duration-300 group-hover:scale-110 shrink-0 ${
                      isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-slate-400 group-hover:text-sky-300'
                    }`} 
                  />

                  {!isCollapsed ? (
                    <span className="animate-fade-in">{item.nome}</span>
                  ) : (
                    /* Beautiful dark floating tooltip when collapsed */
                    <div className="absolute left-16 px-3 py-2 bg-[#090e16] text-white text-[10px] tracking-wider uppercase font-bold rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 group-hover:left-[72px] transition-all duration-300 shadow-2xl pointer-events-none z-50 whitespace-nowrap">
                      {item.nome}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#090e16] border-b border-l border-white/10 rotate-45" />
                    </div>
                  )}

                  {!isCollapsed && isActive && (
                    <ChevronRight size={12} className="ml-auto text-blue-400/80 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
 
        {/* User Card & Logout */}
        <div className={`mt-auto flex flex-col gap-4 pt-6 border-t border-white/5 ${isCollapsed ? 'items-center' : 'items-stretch'}`}>
          <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'justify-center w-full relative group' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {!isCollapsed ? (
              <div className="overflow-hidden animate-fade-in text-left">
                <p className="text-xs font-bold text-slate-205 truncate tracking-wide">
                  {user?.user_metadata?.nome_completo || 'Administrador'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {user?.email || 'admin@igreja.com'}
                </p>
              </div>
            ) : (
              /* User details tooltip */
              <div className="absolute left-16 px-3.5 py-2 bg-[#090e16] text-white text-[10px] font-bold rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 group-hover:left-[72px] transition-all duration-300 shadow-2xl pointer-events-none z-50 whitespace-nowrap flex flex-col text-left">
                <span className="text-slate-100">{user?.user_metadata?.nome_completo || 'Administrador'}</span>
                <span className="text-[9px] text-slate-400 font-mono font-normal mt-0.5">{user?.email || 'admin@igreja.com'}</span>
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#090e16] border-b border-l border-white/10 rotate-45" />
              </div>
            )}
          </div>
 
          <div className={`flex flex-col gap-2.5 ${isCollapsed ? 'w-full items-center' : ''}`}>
            {isCollapsed ? (
              <>
                {/* Compact Circular Actions when Collapsed */}
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center w-10 h-10 text-sky-400 hover:text-white bg-sky-950/20 hover:bg-sky-900/30 border border-sky-500/20 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md group relative"
                >
                  <ExternalLink size={14} />
                  <div className="absolute left-14 px-3 py-2 bg-[#090e16] text-white text-[10px] tracking-wider uppercase font-bold rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 group-hover:left-[52px] transition-all duration-300 shadow-2xl pointer-events-none z-50 whitespace-nowrap">
                    Form Público
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#090e16] border-b border-l border-white/10 rotate-45" />
                  </div>
                </button>

                <button
                  onClick={logoutUser}
                  className="flex items-center justify-center w-10 h-10 text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md group relative"
                >
                  <LogOut size={14} />
                  <div className="absolute left-14 px-3 py-2 bg-[#090e16] text-white text-[10px] tracking-wider uppercase font-bold rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 group-hover:left-[52px] transition-all duration-300 shadow-2xl pointer-events-none z-50 whitespace-nowrap">
                    Sair do Sistema
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#090e16] border-b border-l border-white/10 rotate-45" />
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/')}
                  id="sidebar-btn-public-form"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-sky-400 hover:text-white bg-sky-950/20 hover:bg-sky-900/30 border border-sky-500/20 rounded-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
                >
                  <ExternalLink size={12} />
                  <span>Ver Form Público</span>
                </button>
     
                <button
                  onClick={logoutUser}
                  id="sidebar-btn-logout"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 rounded-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
                >
                  <LogOut size={12} />
                  <span>Sair do Sistema</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Top bar - Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-lg border-b border-white/5 shadow-md z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          {churchConfig.logo_url ? (
            <img 
              src={churchConfig.logo_url} 
              alt="Logo da Igreja" 
              className="w-8 h-8 object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Church size={16} />
            </div>
          )}
          <span className="font-semibold text-base text-white tracking-tight">
            {churchConfig.nome}
          </span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          id="mobile-menu-toggle"
          className="p-2 border border-white/10 rounded-xl bg-white/5 active:bg-white/10 text-white cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-slate-950/95 backdrop-blur-2xl z-40 flex flex-col p-6 animate-fade-in">
          <nav className="flex flex-col gap-3 py-4">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  id={`mobile-link-${item.id}`}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-base font-medium transition-transform active:scale-98 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 text-blue-300 border-l-4 border-blue-500'
                      : 'text-slate-400 bg-white/5'
                  }`}
                >
                  <IconComp size={20} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                  <span>{item.nome}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pb-8 flex flex-col gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {user?.user_metadata?.nome_completo || 'Administrador'}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.email || 'admin@igreja.com'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
                id="mobile-btn-form"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-semibold bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 cursor-pointer"
              >
                Form Público
              </button>
              <button
                onClick={() => {
                  logoutUser();
                  setIsMobileMenuOpen(false);
                }}
                id="mobile-btn-logout"
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-semibold bg-rose-950/40 border border-rose-500/20 text-rose-300 cursor-pointer"
              >
                Sair do Sistema
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto relative z-10">
        {/* Child Workspace Container with Motion animation */}
        <div className="flex-1 w-full p-0.5 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
