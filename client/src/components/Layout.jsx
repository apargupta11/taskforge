import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Kanban, Users, BarChart3, Settings, LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: Layout, label: 'Overview', path: '/dashboard' },
  { icon: Kanban, label: 'My Boards', path: '/dashboard', hash: '#boards' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export const Sidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden lg:flex flex-col">
      <Link to="/dashboard" className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Layout className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-display font-bold tracking-tight text-white">TaskForge</span>
      </Link>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map(item => {
          const active = location.pathname === item.path && !item.hash;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                active ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
            location.pathname === '/settings' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <Settings className={`w-5 h-5 ${location.pathname === '/settings' ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
          <span className="font-medium text-sm">Settings</span>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const TopBar = ({ children }) => {
  const { user } = useAuth();
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30 backdrop-blur-md sticky top-0 z-20">
      {children || (
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search tasks, projects..." className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all text-white" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#0b1326]" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{user?.user_metadata?.name || 'User'}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.email}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 p-0.5">
            <div className="w-full h-full rounded-full bg-[#0b1326] flex items-center justify-center text-[10px] font-bold text-white">
              {user?.email?.substring(0,2).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
