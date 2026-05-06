import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, CheckCircle2, AlertCircle, 
  ChevronRight, Layout, Calendar, Loader2, Trash2,
  Clock, Flag, X, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';

// Components
import StatCard from '../components/dashboard/StatCard';
import ModalOverlay from '../components/common/ModalOverlay';

// ─── Priority badge ──────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const map = {
    high:   'bg-red-500/10 text-red-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low:    'bg-green-500/10 text-green-400',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[priority] ?? map.medium}`}>
      {priority}
    </span>
  );
};

// ─── Inline task panel ───────────────────────────────────────────────────────
const TaskListPanel = ({ title, tasks, loading, color, onClose }) => {
  const colorMap = {
    violet: { accent: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/5' },
    emerald: { accent: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
    red: { accent: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
  };
  const c = colorMap[color] ?? colorMap.violet;

  return (
    <motion.div
      key="task-panel"
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className={`glass-card border ${c.border} ${c.bg}`}>
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
          <h3 className={`font-semibold text-sm ${c.accent}`}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel body */}
        <div className="divide-y divide-slate-800/40 max-h-80 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="py-10 text-center text-slate-500 text-sm">
              No tasks here. 🎉
            </div>
          )}

          {!loading && tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/20 transition-colors group">
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                task.status === 'done' ? 'bg-emerald-400' :
                task.status === 'in-progress' ? 'bg-violet-400' : 'bg-slate-600'
              }`} />

              {/* Task info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.projects?.name && (
                    <span className="text-[10px] text-slate-500 truncate">{task.projects.name}</span>
                  )}
                  {task.deadline && (
                    <span className={`text-[10px] flex items-center gap-1 ${
                      new Date(task.deadline) < new Date() && task.status !== 'done'
                        ? 'text-red-400' : 'text-slate-500'
                    }`}>
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={task.priority} />
                <Link
                  to={`/project/${task.project_id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700"
                  title="Open project"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const { user } = useAuth();

  // Inline panels
  const [activePanel, setActivePanel] = useState(null); // 'active' | 'completed' | 'overdue'
  const [panelTasks, setPanelTasks] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const projectsSectionRef = useRef(null);

  useEffect(() => {
    loadDashboardData();

    // Realtime: refresh stats whenever any task changes
    // (e.g., user marks a task done in the Kanban board)
    const channel = supabase
      .channel('dashboard_task_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        // Refresh stats silently — don't show the full loading spinner
        api.getStats()
          .then(res => setStats(res.data))
          .catch(err => console.error('Stats refresh failed', err));

        // If a panel is open, refresh its task list too
        setActivePanel(prev => {
          if (prev) {
            api.getStatTasks(prev)
              .then(res => setPanelTasks(Array.isArray(res.data) ? res.data : []))
              .catch(() => {});
          }
          return prev;
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
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

  // Toggle stat card panels
  const handleStatClick = async (filter) => {
    if (activePanel === filter) {
      setActivePanel(null);
      return;
    }

    // Active projects — scroll to the existing projects grid, no separate panel
    if (filter === 'active') {
      setActivePanel(null);
      projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setActivePanel(filter);
    setPanelTasks([]);
    setPanelLoading(true);
    try {
      const res = await api.getStatTasks(filter);
      setPanelTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load task list', err);
    } finally {
      setPanelLoading(false);
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

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project? All tasks and data will be permanently removed.')) return;
    try {
      await api.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Failed to delete project', err);
      alert('Failed to delete project. Please check if you have the necessary permissions.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );

  const panelConfig = {
    completed: { title: `Completed Tasks (${panelTasks.length})`, color: 'emerald' },
    overdue:   { title: `Overdue Tasks (${panelTasks.length})`,   color: 'red' },
  };

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

        {/* Stats Grid + Inline Panels */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={Layout}
              label="Active Projects"
              value={projects.length}
              color="violet"
              delay={0.1}
              active={false}
              onClick={() => handleStatClick('active')}
            />
            <StatCard
              icon={CheckCircle2}
              label="Tasks Completed"
              value={stats.completed}
              color="emerald"
              delay={0.2}
              active={activePanel === 'completed'}
              onClick={() => handleStatClick('completed')}
            />
            <StatCard
              icon={AlertCircle}
              label="Overdue Tasks"
              value={stats.overdue}
              color="red"
              delay={0.3}
              active={activePanel === 'overdue'}
              onClick={() => handleStatClick('overdue')}
            />
          </div>

          {/* Animated inline panel */}
          <AnimatePresence mode="wait">
            {activePanel && panelConfig[activePanel] && (
              <TaskListPanel
                key={activePanel}
                title={panelConfig[activePanel].title}
                tasks={panelTasks}
                loading={panelLoading}
                color={panelConfig[activePanel].color}
                onClose={() => setActivePanel(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Projects Section */}
        <section id="projects-section" ref={projectsSectionRef}>
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
                      <div className="flex items-center gap-2">
                        {user?.role === 'admin' && (
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                      </div>
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
