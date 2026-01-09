const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');

//PUBLIC
router.post('/register', authController.register);
router.post('/login', authController.login);

//AUTH MIDDLEWARE
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;