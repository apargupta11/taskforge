const { createUserClient } = require('../config/supabase');

exports.getTasks = async (req, res) => {
  const { projectId } = req.params;
  const userClient = createUserClient(req.token);

  const { data, error } = await userClient
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.createTask = async (req, res) => {
  const { project_id, title, description, priority, status, assigned_to } = req.body;
  const userClient = createUserClient(req.token);

  const { data, error } = await userClient
    .from('tasks')
    .insert([{ 
      project_id, 
      title, 
      description, 
      priority, 
      status: status || 'todo',
      assigned_to: assigned_to || req.user.id 
    }])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;
  const userClient = createUserClient(req.token);
  
  const { data, error } = await userClient
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userClient = createUserClient(req.token);

  const { error } = await userClient
    .from('tasks')
    .delete()
    .eq('id', taskId);
    
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};
