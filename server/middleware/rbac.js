/**
 * Role-Based Access Control (RBAC)
 *
 * Role hierarchy (most → least privileged):
 *   admin > member > viewer
 *
 * project_members.role drives per-project access.
 * users.role is the platform-wide role (used only for admin-only platform ops).
 */

const ROLES = Object.freeze({
  ADMIN:  'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
});

/**
 * What each project-scoped role may do.
 * All checks should consult this object — never hardcode strings.
 */
const PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: {
    readAllTasks:    true,
    createTask:      true,
    updateAnyTask:   true,
    deleteAnyTask:   true,
    manageMembers:   true,
    deleteProject:   true,
  },
  [ROLES.MEMBER]: {
    readAllTasks:    true,
    createTask:      true,
    updateAnyTask:   false, // members can only update tasks assigned to them (enforced in controller)
    deleteAnyTask:   false,
    manageMembers:   false,
    deleteProject:   false,
  },
  [ROLES.VIEWER]: {
    readAllTasks:    false, // viewers see ONLY tasks assigned to them
    createTask:      false,
    updateAnyTask:   false,
    deleteAnyTask:   false,
    manageMembers:   false,
    deleteProject:   false,
  },
});

/**
 * Express middleware factory.
 * Attaches req.projectRole and rejects requests where the caller's
 * project-scoped role lacks the required permission.
 *
 * Usage:
 *   router.post('/', authenticate, requirePermission('createTask'), handler)
 *
 * Depends on: authenticate (sets req.user + req.token)
 *             loadProjectRole (sets req.projectRole) — called first for project routes
 */
const requirePermission = (permission) => (req, res, next) => {
  const role = req.projectRole ?? req.user?.role ?? ROLES.VIEWER;
  const allowed = PERMISSIONS[role]?.[permission] ?? false;

  if (!allowed) {
    return res.status(403).json({
      error: 'Forbidden',
      detail: `Your role '${role}' does not have '${permission}' permission in this project.`,
    });
  }
  next();
};

module.exports = { ROLES, PERMISSIONS, requirePermission };
