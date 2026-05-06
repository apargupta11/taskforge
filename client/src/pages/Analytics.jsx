import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Layout, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';

const Analytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      let tasksQuery = supabase.from('tasks').select('*');
      
      // Filter for viewers
      if (user?.role === 'viewer') {
        tasksQuery = tasksQuery.eq('assigned_to', user.id);
      }

      const [{ data: tasks }, { data: projects }, { data: users }] = await Promise.all([
        tasksQuery,
        supabase.from('projects').select('*'),
        supabase.from('users').select('*')
      ]);

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
    if (user) loadAnalytics();
  }, [user]);

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
        <StatCard label="Total Tasks" value={data.tasks.length} icon={Layout} color="violet" />
        <StatCard label="Completion Rate" value={`${data.completionRate}%`} icon={TrendingUp} color="cyan" />
        <StatCard label="Overdue" value={data.overdue.length} icon={AlertTriangle} color="pink" />
        <StatCard label="High Priority" value={data.highPriority.length} icon={Clock} color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Status Breakdown Bar */}
        <div id="status-breakdown" className="glass-card">
          <h3 className="text-lg font-bold text-white mb-6">Status Breakdown</h3>
          <div className="space-y-5">
            <ProgressBar label="To Do" value={data.todo.length} total={data.tasks.length} color="from-slate-500 to-slate-400" />
            <ProgressBar label="In Progress" value={data.inProgress.length} total={data.tasks.length} color="from-amber-500 to-yellow-400" />
            <ProgressBar label="Done" value={data.done.length} total={data.tasks.length} color="from-emerald-500 to-cyan-400" />
          </div>
        </div>

        {/* Priority Breakdown */}
        <div id="priority-distribution" className="glass-card">
          <h3 className="text-lg font-bold text-white mb-6">Priority Distribution</h3>
          <div className="space-y-5">
            <ProgressBar label="High" value={data.tasks.filter(t => t.priority === 'high').length} total={data.tasks.length} color="from-red-500 to-pink-400" />
            <ProgressBar label="Medium" value={data.tasks.filter(t => t.priority === 'medium').length} total={data.tasks.length} color="from-amber-500 to-yellow-400" />
            <ProgressBar label="Low" value={data.tasks.filter(t => t.priority === 'low').length} total={data.tasks.length} color="from-emerald-500 to-green-400" />
          </div>
        </div>
      </div>

      {/* Project Performance */}
      <div id="project-performance" className="glass-card">
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
