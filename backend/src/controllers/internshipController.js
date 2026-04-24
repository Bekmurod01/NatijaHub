// backend/src/controllers/internshipController.js
const internshipService = require('../services/internshipService');

exports.getAllInternships = async (req, res, next) => {
  try {
    const { page, limit, type, status } = req.query;
    const result = await internshipService.getAllInternships({ page, limit, type, status });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.createInternship = async (req, res, next) => {
  try {
    const internship = req.body;
    const created = await internshipService.createInternship(internship);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};
