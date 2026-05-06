const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, statsController.getStats);
router.get('/tasks', authenticate, statsController.getTaskList);

module.exports = router;
