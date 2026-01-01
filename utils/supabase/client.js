import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // create a supabase client on the browser with project credentials
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
