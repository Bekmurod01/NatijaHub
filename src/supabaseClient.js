// src/supabaseClient.js
// ⚠️ Bu yerga Supabase dashboard dan URL va ANON KEY ni qo'ying
// Supabase → Settings → API

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zczkpmbjdhilsvqjflbk.supabase.co'       // ← o'zgartiring
const SUPABASE_ANON_KEY = 'sb_publishable_D6WgWIIzNYFE7Q0Gi0nSUA_pNlwNb1k'                // ← o'zgartiring

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)