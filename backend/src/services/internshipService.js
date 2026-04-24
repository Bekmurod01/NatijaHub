// backend/src/services/internshipService.js
const supabase = require('../config/supabaseClient');

async function getAllInternships({ page = 1, limit = 10, type, status }) {
  let query = supabase.from('internships').select('*', { count: 'exact' });
  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

async function createInternship(internship) {
  const { data, error } = await supabase.from('internships').insert([internship]);
  if (error) throw error;
  return data[0];
}

module.exports = {
  getAllInternships,
  createInternship,
};
