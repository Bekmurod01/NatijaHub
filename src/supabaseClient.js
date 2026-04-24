import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

function getConfigError() {
  if (!supabaseUrl) {
    return "Missing REACT_APP_SUPABASE_URL. Add it to your .env file.";
  }

  if (!supabaseAnonKey) {
    return "Missing REACT_APP_SUPABASE_ANON_KEY. Add it to your .env file.";
  }

  try {
    const parsed = new URL(supabaseUrl);

    if (!parsed.hostname.endsWith(".supabase.co")) {
      return "REACT_APP_SUPABASE_URL must point to your Supabase project URL.";
    }
  } catch {
    return "REACT_APP_SUPABASE_URL is not a valid URL.";
  }

  return null;
}

const configError = getConfigError();
const client = configError ? null : createClient(supabaseUrl, supabaseAnonKey);

export const supabase = client ?? new Proxy(
  {},
  {
    get() {
      throw new Error(configError);
    },
  }
);

export function getSupabaseClient() {
  if (!client) {
    throw new Error(configError);
  }

  return client;
}
