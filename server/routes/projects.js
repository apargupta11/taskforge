const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { authenticate, loadProjectRole, isAdmin } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

// Platform-wide project listing (any authenticated user can see their projects via RLS)
router.get('/', authenticate, projectController.getProjects);

// Creating a project is a platform-level action, any authenticated user may do it
router.post('/', authenticate, projectController.createProject);

// ── Project-scoped routes (loadProjectRole injects req.projectRole) ──────────

// Tasks list: all roles can hit this endpoint; controller filters based on role
router.get(
  '/:projectId/tasks',
  authenticate,
  loadProjectRole('projectId'),
  taskController.getTasks
);

// Member management: admin-only within the project
router.post(
  '/:projectId/members',
  authenticate,
  loadProjectRole('projectId'),
  requirePermission('manageMembers'),
  projectController.addMember
);

router.delete(
  '/:projectId/members/:userId',
  authenticate,
  loadProjectRole('projectId'),
  requirePermission('manageMembers'),
  projectController.removeMember
);

// Project deletion: admin-only within the project AND platform admin
router.delete(
  '/:projectId',
  authenticate,
  loadProjectRole('projectId'),
  requirePermission('deleteProject'),
  projectController.deleteProject
);

module.exports = router;
