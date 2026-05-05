import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle2, Clock, AlertCircle, 
  ChevronRight, Layout, Calendar, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Components
import StatCard from '../components/dashboard/StatCard';
import ModalOverlay from '../components/common/ModalOverlay';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projRes, statsRes] = await Promise.all([
        api.getProjects(),
        api.getStats()
      ]);
      setProjects(projRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProject(newProject);
      setProjects([res.data, ...projects]);
      setShowNewProjectModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="text-slate-200 p-8">
      <main className="max-w-7xl mx-auto space-y-12">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-slate-400">Here's what's happening with your projects today.</p>
          </motion.div>
          {user?.role === 'admin' && (
            <button onClick={() => setShowNewProjectModal(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Project
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Layout} label="Active Projects" value={projects.length} color="violet" delay={0.1} />
          <StatCard icon={CheckCircle2} label="Tasks Completed" value={stats.completed} color="emerald" delay={0.2} />
          <StatCard icon={AlertCircle} label="Overdue Tasks" value={stats.overdue} color="red" delay={0.3} />
        </div>

        {/* Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div 
                key={project.id} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.1 * i }}
              >
                <Link to={`/project/${project.id}`} className="block group">
                  <div className="glass-card p-6 border-slate-700/50 group-hover:border-violet-500/30 transition-all h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400">
                        <Layout className="w-5 h-5" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                    <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-2">{project.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-800/50 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full py-12 text-center glass-card border-dashed border-slate-700">
                <p className="text-slate-500">No projects yet. Create your first one to get started!</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProjectModal && (
          <ModalOverlay onClose={() => setShowNewProjectModal(false)}>
            <h3 className="text-xl font-bold text-white mb-6">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input 
                  type="text" 
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})} 
                  placeholder="e.g., Marketing Campaign" 
                  className="input-field" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea 
                  value={newProject.description} 
                  onChange={e => setNewProject({...newProject, description: e.target.value})} 
                  placeholder="What is this project about?" 
                  className="input-field h-32 resize-none" 
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-4">Create Project</button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
