import { createClient } from "@supabase/supabase-js";

/**
 * Cliente sin sesión para leer datos públicos desde el servidor.
 * No usa cookies, así las páginas públicas pueden cachearse (ISR).
 */
export function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
