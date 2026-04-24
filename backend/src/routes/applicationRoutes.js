// backend/src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, applicationController.createApplication);
router.get('/', authMiddleware, applicationController.getApplications);
router.put('/:id/status', authMiddleware, applicationController.updateApplicationStatus);

module.exports = router;
