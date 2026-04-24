// backend/src/config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isValidSupabaseConfig(url, key) {
	return (
		typeof url === 'string' && url.startsWith('http') &&
		typeof key === 'string' && key.length > 10 && !key.includes('your_key') && !url.includes('your_url')
	);
}

if (!isValidSupabaseConfig(supabaseUrl, supabaseServiceRoleKey)) {
	console.error('\n\x1b[31mERROR: Invalid Supabase configuration in .env\x1b[0m');
	console.error('Please configure Supabase credentials in .env before starting server.');
	console.error('Required fields: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
	console.error('Get them from your Supabase dashboard: Settings → API');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
