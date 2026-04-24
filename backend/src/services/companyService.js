// backend/src/services/companyService.js
const supabase = require('../config/supabaseClient');

async function getCompanyInternships(companyId) {
  const { data, error } = await supabase.from('internships').select('*').eq('company_id', companyId);
  if (error) throw error;
  return data;
}

async function getCompanyApplications(companyId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, internship:internship_id(*)')
    .eq('internship.company_id', companyId);
  if (error) throw error;
  return data;
}

module.exports = { getCompanyInternships, getCompanyApplications };
