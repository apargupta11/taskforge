const { createUserClient } = require('../config/supabase');

exports.getStats = async (req, res) => {
  const userClient = createUserClient(req.token);

  const { data: tasks, error } = await userClient
    .from('tasks')
    .select('status, deadline');
    
  if (error) return res.status(500).json({ error: error.message });
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()).length
  };
  
  res.json(stats);
};
