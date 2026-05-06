const { supabase } = require('../config/supabase');

exports.getProjects = async (req, res) => {
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // If not admin, only show projects they are a member of
  if (req.user.role !== 'admin') {
    const { data: memberData } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', req.user.id);
      
    const projectIds = memberData ? memberData.map(m => m.project_id) : [];
    
    if (projectIds.length > 0) {
      query = query.in('id', projectIds);
    } else {
      return res.json([]); // Not a member of any project
    }
  }

  const { data, error } = await query;
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;

  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, description, created_by: req.user.id }])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });

  // Add the creator as an admin member to the project automatically
  const { error: memberError } = await supabase
    .from('project_members')
    .insert([{ project_id: data.id, user_id: req.user.id, role: 'admin' }]);

  if (memberError) {
    return res.status(400).json({
      error: memberError.message,
      hint: 'Project may exist without membership. Check project_members INSERT policies in Supabase.',
    });
  }

  res.status(201).json(data);
};

exports.addMember = async (req, res) => {
  const { projectId } = req.params;
  const { user_id, role } = req.body;

  const { data, error } = await supabase
    .from('project_members')
    .insert([{ project_id: projectId, user_id, role: role || 'member' }])
    .select()
    .single();
    
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.removeMember = async (req, res) => {
  const { projectId, userId } = req.params;

  const { error } = await supabase
    .from('project_members')
    .delete()
    .match({ project_id: projectId, user_id: userId });
    
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};

exports.deleteProject = async (req, res) => {
  const { projectId } = req.params;

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
    
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, message: 'Project deleted successfully' });
};
