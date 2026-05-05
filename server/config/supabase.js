const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createUserClient = (token) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
};

module.exports = {
  supabase,
  createUserClient,
  supabaseUrl,
  supabaseKey
};
