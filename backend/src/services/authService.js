// backend/src/services/authService.js
const supabase = require('../config/supabaseClient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function register({ email, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert([{ email, password: hashedPassword, role }]);
  if (error) throw error;
  return data[0];
}

async function login(email, password) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error || !data) throw new Error('Invalid credentials');
  const valid = await bcrypt.compare(password, data.password);
  if (!valid) throw new Error('Invalid credentials');
  const token = jwt.sign({ id: data.id, role: data.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return token;
}

async function resetPassword(email) {
  // Implement email sending logic here
  return true;
}

module.exports = { register, login, resetPassword };
