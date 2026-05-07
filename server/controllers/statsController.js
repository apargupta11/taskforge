const { supabase } = require('../config/supabase');

exports.getStats = async (req, res, next) => {
  const db = req.supabase || supabase;

  let query = db.from('tasks').select('id, status, deadline, assigned_to, project_id');
  
  const { data: tasks, error } = await query;
  if (error) return next(error);

  let visibleTasks = tasks;

  if (req.user.role !== 'admin') {
    const { data: memberships } = await db
      .from('project_members')
      .select('project_id, role')
      .eq('user_id', req.user.id);
      
    const userProjects = memberships || [];
    
    visibleTasks = tasks.filter(task => {
      const membership = userProjects.find(m => m.project_id === task.project_id);
      if (!membership) return false;
      if (req.user.role === 'viewer' || membership.role === 'viewer') {
        return task.assigned_to === req.user.id;
      }
      return true;
    });
  }
  
  const stats = {
    total: visibleTasks.length,
    completed: visibleTasks.filter(t => t.status === 'done').length,
    overdue: visibleTasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length
  };
  
  res.json(stats);
};

/**
 * GET /api/stats/tasks?filter=completed|overdue|active
 */
exports.getTaskList = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { filter } = req.query;

  let query = db
    .from('tasks')
    .select('id, title, status, priority, deadline, assigned_to, project_id, projects(name)')
    .order('created_at', { ascending: false });

  const { data: tasks, error } = await query;
  if (error) return next(error);

  let visibleTasks = tasks;

  if (req.user.role !== 'admin') {
    const { data: memberships } = await db
      .from('project_members')
      .select('project_id, role')
      .eq('user_id', req.user.id);
      
    const userProjects = memberships || [];
    
    visibleTasks = tasks.filter(task => {
      const membership = userProjects.find(m => m.project_id === task.project_id);
      if (!membership) return false;
      if (req.user.role === 'viewer' || membership.role === 'viewer') {
        return task.assigned_to === req.user.id;
      }
      return true;
    });
  }

  const now = new Date();
  let filtered;
  switch (filter) {
    case 'completed':
      filtered = visibleTasks.filter(t => t.status === 'done');
      break;
    case 'overdue':
      filtered = visibleTasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < now);
      break;
    case 'active':
      filtered = visibleTasks.filter(t => t.status !== 'done');
      break;
    default:
      filtered = visibleTasks;
  }

  res.json(filtered);
};
