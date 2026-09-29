import { createClient } from '@supabase/supabase-js';

// Replace these with your project's details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co'; // Supabase project URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key'; // Public API key
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key'; // Service Role Key

export const supabase = createClient(supabaseUrl, serviceRoleKey);
