// backend/src/services/notificationService.js
const supabase = require('../config/supabaseClient');

async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function createNotification({ user_id, message, type }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ user_id, message, type, is_read: false }]);
  if (error) throw error;
  return data[0];
}

async function markAsRead(id, userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

module.exports = { getNotifications, createNotification, markAsRead };
