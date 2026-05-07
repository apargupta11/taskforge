const { supabase, createUserClient } = require('../config/supabase');
const { ROLES } = require('./rbac');

/**
 * Verifies the Bearer token and attaches req.user (with platform role)
 * and req.token to every protected request.
 */
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Error fetching user role:', userError);
    req.user = { ...user, role: ROLES.VIEWER }; // safe default
  } else {
    req.user = { ...user, ...userData };
  }

  req.token = token;
  // Attach a user-scoped Supabase client so all DB queries carry the JWT.
  // This makes auth.uid() resolve correctly in RLS policies.
  req.supabase = createUserClient(token);
  next();
};

/**
 * Middleware factory: loads the caller's role within a specific project
 * and attaches it as req.projectRole.
 *
 * Expects req.params[paramName] to hold the project UUID.
 * Falls back to 'viewer' if the user is not a project member.
 *
 * Usage:
 *   router.get('/:projectId/tasks', authenticate, loadProjectRole('projectId'), handler)
 */
const loadProjectRole = (paramName = 'projectId') => async (req, res, next) => {
  const projectId = req.params[paramName];
  if (!projectId) return next();

  const db = req.supabase || supabase;
  const { data, error } = await db
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) {
    console.error('loadProjectRole error:', error);
    return res.status(500).json({ error: 'Could not resolve project role' });
  }

  if (!data && req.user.role === ROLES.ADMIN) {
    req.projectRole = ROLES.ADMIN;
  } else {
    req.projectRole = data?.role ?? ROLES.VIEWER;
  }

  next();
};

/** Convenience: reject non-admin platform users (for platform-wide ops). */
const isAdmin = (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, loadProjectRole, isAdmin };
