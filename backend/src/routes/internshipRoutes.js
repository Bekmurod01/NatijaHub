// backend/src/routes/internshipRoutes.js
const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');

router.get('/', internshipController.getAllInternships);
router.post('/', internshipController.createInternship);
// router.put('/:id', ...);
// router.delete('/:id', ...);

module.exports = router;
