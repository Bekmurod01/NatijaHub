// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
