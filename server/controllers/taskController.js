const { supabase } = require('../config/supabase');
const { ROLES, PERMISSIONS } = require('../middleware/rbac');

async function resolveProjectRole(userId, projectId, platformRole, db) {
  if (!projectId) return ROLES.VIEWER;

  const { data } = await db
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!data && platformRole === ROLES.ADMIN) return ROLES.ADMIN;
  return data?.role ?? ROLES.VIEWER;
}

/**
 * GET /projects/:projectId/tasks
 *
 * - admin / member  → all tasks in the project
 * - viewer          → only tasks assigned to them (enforced server-side)
 */
exports.getTasks = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { projectId } = req.params;
  const role = req.projectRole ?? ROLES.VIEWER;

  let query = db
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  // Viewers are scoped to their own tasks
  if (!PERMISSIONS[role]?.readAllTasks || req.user.role === 'viewer') {
    query = query.eq('assigned_to', req.user.id);
  }

  const { data, error } = await query;
  if (error) return next(error);
  res.json(data);
};

/**
 * POST /tasks
 */
exports.createTask = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { project_id, title, description, priority, status, assigned_to } = req.body;
  const role = req.projectRole
    ?? await resolveProjectRole(req.user.id, project_id, req.user.role, db);

  if (!PERMISSIONS[role]?.createTask) {
    return res.status(403).json({ error: 'Viewers cannot create tasks' });
  }

  const { data, error } = await db
    .from('tasks')
    .insert([{
      project_id,
      title,
      description,
      priority,
      status: status || 'todo',
      assigned_to: assigned_to || req.user.id,
    }])
    .select()
    .single();

  if (error) return next(error);
  res.status(201).json(data);
};

/**
 * PATCH /tasks/:taskId
 */
exports.updateTask = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { taskId } = req.params;

  let role = req.projectRole;
  if (!role) {
    const { data: taskRow } = await db
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();
    role = taskRow
      ? await resolveProjectRole(req.user.id, taskRow.project_id, req.user.role, db)
      : ROLES.VIEWER;
  }

  if (!PERMISSIONS[role]?.createTask) {
    return res.status(403).json({ error: 'Viewers cannot modify tasks' });
  }

  if (!PERMISSIONS[role]?.updateAnyTask) {
    const { data: existing, error: fetchErr } = await db
      .from('tasks')
      .select('assigned_to')
      .eq('id', taskId)
      .single();

    if (fetchErr) return next(fetchErr);
    if (existing.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit tasks assigned to you' });
    }
  }

  const { id, project_id, created_at, ...safeUpdates } = req.body;

  const { data, error } = await db
    .from('tasks')
    .update(safeUpdates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) return next(error);
  res.json(data);
};

/**
 * DELETE /tasks/:taskId
 */
exports.deleteTask = async (req, res, next) => {
  const db = req.supabase || supabase;
  const { taskId } = req.params;

  let role = req.projectRole;
  if (!role) {
    const { data: taskRow } = await db
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();
    role = taskRow
      ? await resolveProjectRole(req.user.id, taskRow.project_id, req.user.role, db)
      : ROLES.VIEWER;
  }

  if (!PERMISSIONS[role]?.createTask) {
    return res.status(403).json({ error: 'Viewers cannot delete tasks' });
  }

  if (!PERMISSIONS[role]?.deleteAnyTask) {
    const { data: existing, error: fetchErr } = await db
      .from('tasks')
      .select('assigned_to')
      .eq('id', taskId)
      .single();

    if (fetchErr) return next(fetchErr);
    if (existing.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete tasks assigned to you' });
    }
  }

  const { error } = await db
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) return next(error);
  res.json({ success: true });
};
