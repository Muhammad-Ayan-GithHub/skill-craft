// Supabase Configuration
const SUPABASE_URL = 'https://qvlyununrodiflnqqbjv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_evkijutCPf1NT1rqreUcfg_YhSodhq3';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Export for use in other files
window.supabaseClient = supabase;
