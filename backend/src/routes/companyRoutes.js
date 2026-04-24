// backend/src/routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const internshipController = require('../controllers/internshipController');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware, roleMiddleware('company'));

router.get('/internships', companyController.getCompanyInternships);
router.get('/applications', companyController.getCompanyApplications);
router.post('/internships', internshipController.createInternship);
router.put('/applications/:id/status', applicationController.updateApplicationStatus);

module.exports = router;
