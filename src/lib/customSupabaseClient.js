import { createClient } from '@supabase/supabase-js';

// Use .env for your own project, or fall back to the default project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://ejfhgpdtndpxghdzflpt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZmhncGR0bmRweGdoZHpmbHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzYzMTYsImV4cCI6MjA2NzY1MjMxNn0.aj09PS2TcG9HZIpGsb-oM6MV_OkZLZegFDmPsb_5F7c';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
