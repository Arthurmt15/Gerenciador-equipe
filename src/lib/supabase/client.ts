import { createBrowserClient as createClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

export function createBrowserClient() {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key);
}
