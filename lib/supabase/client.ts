import { createClientComponentClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Client-side Supabase client for use in Client Components
 * This client uses the anon key and respects RLS policies
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

