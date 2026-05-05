const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.patch('/:id/role', authenticate, userController.updateUserRole);

module.exports = router;
