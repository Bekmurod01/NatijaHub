exports.getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { id, role, email } = req.user;
  res.json({ id, role, email });
};
// backend/src/controllers/authController.js
const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};


const isProduction = process.env.NODE_ENV === 'production';
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  res.json({ success: true });
};

exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.email);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};
