import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://gisjyrhkxljikrsoqfof.supabase.co";

const SUPABASE_KEY =
  "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
