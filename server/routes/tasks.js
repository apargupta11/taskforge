const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, loadProjectRole } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

/**
 * Task routes use loadProjectRole so controllers have req.projectRole.
 * We pass projectId from the request body for standalone task routes.
 */

// Standalone task mutations — projectId comes from the body
// loadProjectRole won't fire here (no :projectId param), so the
// controller double-checks using req.user.role as fallback.
router.post(
  '/',
  authenticate,
  taskController.createTask
);

router.patch(
  '/:taskId',
  authenticate,
  taskController.updateTask
);

router.delete(
  '/:taskId',
  authenticate,
  taskController.deleteTask
);

module.exports = router;
