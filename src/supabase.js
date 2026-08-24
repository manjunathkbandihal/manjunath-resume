import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Use the existing ANON key for now.
// This is only for browser/client-side access.
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL is missing from Vercel Environment Variables."
  );
}

if (!supabaseKey) {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY is missing from Vercel Environment Variables."
  );
}

console.log("Supabase URL:", supabaseUrl);
console.log(
  "Supabase key loaded:",
  supabaseKey ? "YES" : "NO"
);

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
