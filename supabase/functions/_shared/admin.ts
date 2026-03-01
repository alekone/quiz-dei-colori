import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

export const getBody = async <T>(req: Request): Promise<T> => {
  const text = await req.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
};

export const getBearerToken = (req: Request): string | null => {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

export const getAdminToken = (req: Request): string | null => {
  const headerToken = req.headers.get("x-admin-token");
  if (headerToken && headerToken.trim()) return headerToken.trim();
  return getBearerToken(req);
};

export const sha256Hex = async (value: string): Promise<string> => {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const generateToken = (): string => {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const requireAdmin = async (req: Request) => {
  const token = getAdminToken(req);
  if (!token) {
    return { error: "Token mancante", status: 401 as const };
  }
  const tokenHash = await sha256Hex(token);
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("id, admin_user_id, expires_at, admin_users(is_active)")
    .eq("token_hash", tokenHash)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return { error: "Sessione non valida", status: 401 as const };
  }
  const isActive = (data as { admin_users?: { is_active?: boolean } }).admin_users
    ?.is_active;
  if (isActive === false) {
    return { error: "Admin disattivato", status: 403 as const };
  }

  return { adminUserId: data.admin_user_id as string };
};
