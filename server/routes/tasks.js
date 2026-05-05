const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.get('/project/:projectId', authenticate, taskController.getTasks);
router.post('/', authenticate, taskController.createTask);
router.patch('/:taskId', authenticate, taskController.updateTask);
router.delete('/:taskId', authenticate, taskController.deleteTask);

module.exports = router;
