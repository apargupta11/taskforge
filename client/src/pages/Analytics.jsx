import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, CheckCircle, Layout, Loader2, AlertTriangle } from 'lucide-react';
import { Sidebar, TopBar } from '../components/Layout';
import { supabase } from '../lib/supabase';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      const { data: tasks } = await supabase.from('tasks').select('*');
      const { data: projects } = await supabase.from('projects').select('*');
      const { data: users } = await supabase.from('users').select('*');

      const todo = tasks?.filter(t => t.status === 'todo') || [];
      const inProgress = tasks?.filter(t => t.status === 'in-progress') || [];
      const done = tasks?.filter(t => t.status === 'done') || [];
      const overdue = tasks?.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()) || [];
      const highPriority = tasks?.filter(t => t.priority === 'high') || [];

      setData({
        tasks: tasks || [],
        projects: projects || [],
        users: users || [],
        todo, inProgress, done, overdue, highPriority,
        completionRate: tasks?.length ? Math.round((done.length / tasks.length) * 100) : 0,
      });
      setLoading(false);
    };
    loadAnalytics();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
        <p className="text-slate-400">Insights and metrics across all your projects.</p>
      </div>

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Tasks" value={data.tasks.length} icon={<Layout className="w-5 h-5 text-violet-400" />} />
            <StatCard label="Completion Rate" value={`${data.completionRate}%`} icon={<TrendingUp className="w-5 h-5 text-cyan-400" />} />
            <StatCard label="Overdue" value={data.overdue.length} icon={<AlertTriangle className="w-5 h-5 text-pink-400" />} color="pink" />
            <StatCard label="High Priority" value={data.highPriority.length} icon={<Clock className="w-5 h-5 text-amber-400" />} color="amber" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Status Breakdown Bar */}
            <div className="glass-card">
              <h3 className="text-lg font-bold text-white mb-6">Status Breakdown</h3>
              <div className="space-y-5">
                <ProgressBar label="To Do" value={data.todo.length} total={data.tasks.length} color="from-slate-500 to-slate-400" />
                <ProgressBar label="In Progress" value={data.inProgress.length} total={data.tasks.length} color="from-amber-500 to-yellow-400" />
                <ProgressBar label="Done" value={data.done.length} total={data.tasks.length} color="from-emerald-500 to-cyan-400" />
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="glass-card">
              <h3 className="text-lg font-bold text-white mb-6">Priority Distribution</h3>
              <div className="space-y-5">
                <ProgressBar label="High" value={data.tasks.filter(t => t.priority === 'high').length} total={data.tasks.length} color="from-red-500 to-pink-400" />
                <ProgressBar label="Medium" value={data.tasks.filter(t => t.priority === 'medium').length} total={data.tasks.length} color="from-amber-500 to-yellow-400" />
                <ProgressBar label="Low" value={data.tasks.filter(t => t.priority === 'low').length} total={data.tasks.length} color="from-emerald-500 to-green-400" />
              </div>
            </div>
          </div>

          {/* Project Performance */}
          <div className="glass-card">
            <h3 className="text-lg font-bold text-white mb-6">Project Performance</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {data.projects.map(project => {
                const projectTasks = data.tasks.filter(t => t.project_id === project.id);
                const projectDone = projectTasks.filter(t => t.status === 'done').length;
                const pct = projectTasks.length ? Math.round((projectDone / projectTasks.length) * 100) : 0;
                return (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm">{project.name}</h4>
                      <span className="text-xs font-bold text-violet-400">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                      <span>{projectDone} of {projectTasks.length} tasks done</span>
                      <span>{projectTasks.filter(t => t.status === 'in-progress').length} in progress</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color = 'violet' }) => (
  <div className="glass-card group hover:border-violet-500/30 transition-all duration-500">
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-lg bg-slate-800 group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className="text-2xl font-display font-bold text-white">{value}</div>
  </div>
);

const ProgressBar = ({ label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-xs font-bold text-slate-400">{value} ({pct}%)</span>
      </div>
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full bg-gradient-to-r ${color} rounded-full`} />
      </div>
    </div>
  );
};

export default Analytics;
