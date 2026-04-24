// backend/src/services/userService.js
const supabase = require('../config/supabaseClient');

async function getProfile(userId) {
  const { data, error } = await supabase.from('users').select('id, email, role').eq('id', userId).single();
  if (error) throw error;
  return data;
}

async function updateProfile(userId, updates) {
  const { data, error } = await supabase.from('users').update(updates).eq('id', userId).single();
  if (error) throw error;
  return data;
}

module.exports = { getProfile, updateProfile };
