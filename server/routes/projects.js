const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, projectController.getProjects);
router.post('/', authenticate, projectController.createProject);
router.get('/:projectId/tasks', authenticate, taskController.getTasks);
router.post('/:projectId/members', authenticate, projectController.addMember);
router.delete('/:projectId/members/:userId', authenticate, projectController.removeMember);

module.exports = router;
