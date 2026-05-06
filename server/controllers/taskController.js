const { supabase } = require('../config/supabase');
const { ROLES, PERMISSIONS } = require('../middleware/rbac');

async function resolveProjectRole(userId, projectId, platformRole) {
  if (!projectId) return ROLES.VIEWER;

  const { data } = await supabase
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
 *
 * RLS is the true enforcement layer; this filter is a belt-and-suspenders guard
 * so the application-level contract is clear and auditable.
 */
exports.getTasks = async (req, res) => {
  const { projectId } = req.params;
  const role = req.projectRole ?? ROLES.VIEWER;

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  // Viewers are scoped to their own tasks — never trust the client for this
  if (!PERMISSIONS[role]?.readAllTasks) {
    query = query.eq('assigned_to', req.user.id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

/**
 * POST /tasks
 * Requires createTask permission (admin or member only).
 * Route guards enforce this; controller is an explicit last-line check.
 */
exports.createTask = async (req, res) => {
  const { project_id, title, description, priority, status, assigned_to } = req.body;
  // req.projectRole is set by loadProjectRole middleware for project routes.
  // For standalone POST /tasks we resolve it dynamically from project_id in body.
  const role = req.projectRole
    ?? await resolveProjectRole(req.user.id, project_id, req.user.role);

  if (!PERMISSIONS[role]?.createTask) {
    return res.status(403).json({ error: 'Viewers cannot create tasks' });
  }

  const { data, error } = await supabase
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

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

/**
 * PATCH /tasks/:taskId
 *
 * - admin            → update anything
 * - member           → only tasks assigned to them
 * - viewer           → blocked entirely
 */
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;

  // For standalone PATCH we need to look up the project from the task first
  let role = req.projectRole;
  if (!role) {
    const { data: taskRow } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();
    role = taskRow
      ? await resolveProjectRole(req.user.id, taskRow.project_id, req.user.role)
      : ROLES.VIEWER;
  }

  // Viewers blocked before any DB call
  if (!PERMISSIONS[role]?.createTask) { // createTask doubles as "can mutate tasks"
    return res.status(403).json({ error: 'Viewers cannot modify tasks' });
  }

  // For members who can't update ANY task, verify ownership first
  if (!PERMISSIONS[role]?.updateAnyTask) {
    const { data: existing, error: fetchErr } = await supabase
      .from('tasks')
      .select('assigned_to')
      .eq('id', taskId)
      .single();

    if (fetchErr) return res.status(404).json({ error: 'Task not found' });
    if (existing.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit tasks assigned to you' });
    }
  }

  // Strip fields that should never come from the client
  const { id, project_id, created_at, ...safeUpdates } = req.body;

  const { data, error } = await supabase
    .from('tasks')
    .update(safeUpdates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

/**
 * DELETE /tasks/:taskId
 *
 * - admin  → can delete any task
 * - member → can delete only tasks assigned to them
 * - viewer → blocked
 */
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;

  let role = req.projectRole;
  if (!role) {
    const { data: taskRow } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();
    role = taskRow
      ? await resolveProjectRole(req.user.id, taskRow.project_id, req.user.role)
      : ROLES.VIEWER;
  }

  if (!PERMISSIONS[role]?.createTask) {
    return res.status(403).json({ error: 'Viewers cannot delete tasks' });
  }

  if (!PERMISSIONS[role]?.deleteAnyTask) {
    const { data: existing, error: fetchErr } = await supabase
      .from('tasks')
      .select('assigned_to')
      .eq('id', taskId)
      .single();

    if (fetchErr) return res.status(404).json({ error: 'Task not found' });
    if (existing.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete tasks assigned to you' });
    }
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
};
