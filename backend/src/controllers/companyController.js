// backend/src/controllers/companyController.js
const companyService = require('../services/companyService');

exports.getCompanyInternships = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: "Invalid user or not authenticated" });
  }
  try {
    const internships = await companyService.getCompanyInternships(req.user.id);
    res.json(internships);
  } catch (err) {
    next(err);
  }
};

exports.getCompanyApplications = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: "Invalid user or not authenticated" });
  }
  try {
    const applications = await companyService.getCompanyApplications(req.user.id);
    res.json(applications);
  } catch (err) {
    next(err);
  }
};
