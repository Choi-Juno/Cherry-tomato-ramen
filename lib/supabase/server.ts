import { createServerComponentClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server-side Supabase client for use in Server Components and API Routes
 * This client uses the anon key and respects RLS policies
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

/**
 * Service role client with elevated permissions
 * Use ONLY for server-side operations that bypass RLS
 * NEVER expose this client to the browser
 */
export function createServiceClient() {
  return createClient(); // In production, use service role key
}

