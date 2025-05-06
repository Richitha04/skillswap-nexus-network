
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://woeaopkyvldkkcddrcjg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZWFvcGt5dmxka2tjZGRyY2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxMzk5NDgsImV4cCI6MjAzMDcxNTk0OH0.FP8ynUYZkNJHppPjlhXQQRPwt1Dmi_gBUlOE81xm_2A';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
