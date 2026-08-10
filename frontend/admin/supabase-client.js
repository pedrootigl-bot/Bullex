/**
 * Cliente Supabase compartilhado do Admin.
 * Usa a chave anon (pública). Nunca colocar SERVICE_ROLE_KEY no frontend.
 */
const SUPABASE_URL = "https://trakfklbjqynwonqyrfh.supabase.co";

const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYWtma2xianF5bndvbnF5cmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTk1OTgsImV4cCI6MjEwMTU3NTU5OH0.k5KZ32_zVKlB_VU3FqqCo48_X3h7pZHQ-_57bEKNslQ";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
