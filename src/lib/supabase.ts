import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gyjjkdfkaumfxpohtasn.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5amprZGZrYXVtZnhwb2h0YXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MDMxMjQsImV4cCI6MjA4NjM3OTEyNH0.kLugJ71wuFjGbTU2WKQ_NxKwkW7veNvNnV67FA0HOH0";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application": "strat-planner-pro",
    },
  },
});
