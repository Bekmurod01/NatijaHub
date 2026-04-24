// backend/src/controllers/applicationController.js
const applicationService = require('../services/applicationService');

exports.createApplication = async (req, res, next) => {
  try {
    const app = await applicationService.createApplication(req.body, req.user.id);
    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
};

exports.getApplications = async (req, res, next) => {
  try {
    const apps = await applicationService.getApplications(req.user.id, req.query);
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const updated = await applicationService.updateApplicationStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
