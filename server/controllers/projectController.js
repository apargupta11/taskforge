const { supabase } = require('../config/supabase');
exports.getProjects = async (req, res, next) => {
  const db = req.supabase || supabase;

  let query = db
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  // If not admin, only show projects they are a member of
  if (req.user.role !== 'admin') {
    const { data: memberData } = await db
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
    
  if (error) return next(error);
  res.json(data);
};

exports.createProject = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { name, description } = req.body;

  const { data, error } = await db
    .from('projects')
    .insert([{ name, description, created_by: req.user.id }])
    .select()
    .single();
    
  if (error) return next(error);

  // Add the creator as an admin member to the project automatically
  const { error: memberError } = await db
    .from('project_members')
    .insert([{ project_id: data.id, user_id: req.user.id, role: 'admin' }]);

  if (memberError) {
    return next(memberError);
  }

  res.status(201).json(data);
};

exports.addMember = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { projectId } = req.params;
  const { user_id, role } = req.body;

  const { data, error } = await db
    .from('project_members')
    .insert([{ project_id: projectId, user_id, role: role || 'member' }])
    .select()
    .single();
    
  if (error) return next(error);
  res.status(201).json(data);
};

exports.removeMember = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { projectId, userId } = req.params;

  const { error } = await db
    .from('project_members')
    .delete()
    .match({ project_id: projectId, user_id: userId });
    
  if (error) return next(error);
  res.json({ success: true });
};

exports.deleteProject = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { projectId } = req.params;

  const { error } = await db
    .from('projects')
    .delete()
    .eq('id', projectId);
    
  if (error) return next(error);
  res.json({ success: true, message: 'Project deleted successfully' });
};
