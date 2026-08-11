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

/**
 * Redireciona para login se não houver sessão.
 */
async function requireAdminSession() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    return session;
}

/**
 * Headers JSON com Bearer token da sessão admin.
 */
async function getAuthHeaders(extra = {}) {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    const headers = {
        ...extra
    };

    if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
    }

    return headers;
}
