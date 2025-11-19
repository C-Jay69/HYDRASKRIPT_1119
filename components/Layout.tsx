import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  PenTool, 
  Settings, 
  ChevronRight, 
  Menu,
  X,
  Sparkles,
  Mic2
} from 'lucide-react';

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-500 group-hover:text-brand-400'} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Hydra<span className="text-brand-400">Skript</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
          <NavItem to="/projects" icon={BookOpen} label="My Projects" active={isActive('/projects')} />
          <NavItem to="/story-bible" icon={Library} label="Story Bible" active={isActive('/story-bible')} />
          <NavItem to="/style-engine" icon={PenTool} label="Style Engine" active={isActive('/style-engine')} />
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Tools</p>
            <NavItem to="/audio-studio" icon={Mic2} label="Audiobook Studio" active={isActive('/audio-studio')} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400">
            <Settings size={18} />
            <span>Settings</span>
          </div>
          <div className="mt-4 px-4 py-2 bg-slate-800/50 rounded border border-slate-700/50">
             <p className="text-xs text-slate-500 font-mono">PLAN: PRO</p>
             <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
               <div className="bg-brand-500 w-3/4 h-full rounded-full"></div>
             </div>
             <p className="text-[10px] text-slate-400 mt-1 text-right">140k / 200k tokens</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg">HydraSkript</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900 z-40 pt-20 px-4 md:hidden">
           <nav className="space-y-2">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} />
            <NavItem to="/projects" icon={BookOpen} label="My Projects" active={isActive('/projects')} />
            <NavItem to="/story-bible" icon={Library} label="Story Bible" active={isActive('/story-bible')} />
            <NavItem to="/style-engine" icon={PenTool} label="Style Engine" active={isActive('/style-engine')} />
            <NavItem to="/audio-studio" icon={Mic2} label="Audiobook Studio" active={isActive('/audio-studio')} />
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
