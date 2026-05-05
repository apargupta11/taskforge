const { createUserClient } = require('../config/supabase');

exports.getProjects = async (req, res) => {
  const userClient = createUserClient(req.token);

  const { data, error } = await userClient
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  const userClient = createUserClient(req.token);

  const { data, error } = await userClient
    .from('projects')
    .insert([{ name, description, created_by: req.user.id }])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });

  // Add the creator as an admin member to the project automatically
  await userClient
    .from('project_members')
    .insert([{ project_id: data.id, user_id: req.user.id, role: 'admin' }]);

  res.status(201).json(data);
};

exports.addMember = async (req, res) => {
  const { projectId } = req.params;
  const { user_id, role } = req.body;
  const userClient = createUserClient(req.token);

  const { data, error } = await userClient
    .from('project_members')
    .insert([{ project_id: projectId, user_id, role: role || 'member' }])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.removeMember = async (req, res) => {
  const { projectId, userId } = req.params;
  const userClient = createUserClient(req.token);

  const { error } = await userClient
    .from('project_members')
    .delete()
    .match({ project_id: projectId, user_id: userId });
    
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};
