import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zqvvqofqnpjhqsmhpvtk.supabase.co'; // replace with your project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdnZxb2ZxbnBqaHFzbWhwdnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjkxMjMsImV4cCI6MjA2ODc0NTEyM30.wHVwD4TjVO40iqLtU4REpOmS1xtFs_fK6aDw0dSqYPE'; // replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
