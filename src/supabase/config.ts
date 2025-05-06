import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://woeaopkyvldkkcddrcjg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseKey) {
    console.error('Missing Supabase key. Please check your .env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
