const { createUserClient } = require('../config/supabase');

exports.getStats = async (req, res) => {
  const userClient = createUserClient(req.token);

  let query = userClient.from('tasks').select('status, deadline, assigned_to');
  
  // If user is a viewer, only show their own tasks in the stats
  if (req.user.role === 'viewer') {
    query = query.eq('assigned_to', req.user.id);
  }

  const { data: tasks, error } = await query;
    
  if (error) return res.status(500).json({ error: error.message });
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length
  };
  
  res.json(stats);
};

/**
 * GET /api/stats/tasks?filter=completed|overdue|active
 * Returns the full task records (with project name) for a given filter.
 * Used by the dashboard inline panels.
 */
exports.getTaskList = async (req, res) => {
  const { filter } = req.query;
  const userClient = createUserClient(req.token);

  // Join projects so the client can display the project name
  let query = userClient
    .from('tasks')
    .select('id, title, status, priority, deadline, assigned_to, project_id, projects(name)')
    .order('created_at', { ascending: false });

  if (req.user.role === 'viewer') {
    query = query.eq('assigned_to', req.user.id);
  }

  const { data: tasks, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const now = new Date();
  let filtered;
  switch (filter) {
    case 'completed':
      filtered = tasks.filter(t => t.status === 'done');
      break;
    case 'overdue':
      filtered = tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < now);
      break;
    case 'active':
      filtered = tasks.filter(t => t.status !== 'done');
      break;
    default:
      filtered = tasks;
  }

  res.json(filtered);
};

