import { corsHeaders, json, sha256Hex, getAdminToken, supabase } from "../_shared/admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Metodo non consentito" }, 405);
  }
  const token = getAdminToken(req);
  if (!token) {
    return json({ error: "Token mancante" }, 401);
  }
  const tokenHash = await sha256Hex(token);
  await supabase.from("admin_sessions").delete().eq("token_hash", tokenHash);
  return json({ ok: true });
});
