const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are required in .env');
}

// Admin client — used only for auth.getUser() verification in middleware
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

/**
 * Creates a Supabase client that carries the user's JWT in every request.
 * This makes auth.uid() work in RLS policies, so all data queries pass through RLS correctly.
 */
const createUserClient = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false }
  });
};

module.exports = {
  supabase,
  createUserClient,
  supabaseUrl,
};
