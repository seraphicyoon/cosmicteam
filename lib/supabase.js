import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lzunovtcvpqxgmpefgih.supabase.co";
const supabaseAnonKey = "sb_publishable_-WHjPKiYjdD4V1XOiNqGwg_xjwnDfcq";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});