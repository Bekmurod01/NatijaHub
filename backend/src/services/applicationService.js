// backend/src/services/applicationService.js
const supabase = require('../config/supabaseClient');
const notificationService = require('./notificationService');

async function createApplication(data, userId) {
  const { data: result, error } = await supabase.from('applications').insert([{ ...data, user_id: userId }]);
  if (error) throw error;
  return result[0];
}

async function getApplications(userId, { page = 1, limit = 10 }) {
  let query = supabase.from('applications').select('*', { count: 'exact' }).eq('user_id', userId);
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

async function updateApplicationStatus(id, status) {
  const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).single();
  if (error) throw error;
  // Trigger notification
  if (data && (status === 'accepted' || status === 'rejected')) {
    await notificationService.createNotification({
      user_id: data.user_id,
      message: `Your application was ${status}.`,
      type: 'application_update',
    });
  }
  return data;
}

module.exports = { createApplication, getApplications, updateApplicationStatus };
