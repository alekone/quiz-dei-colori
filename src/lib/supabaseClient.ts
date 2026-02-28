import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseKey);

export const supabaseClient = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseKey)
  : null;
