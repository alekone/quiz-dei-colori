import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { username?: string; password?: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Metodo non consentito" }, 405);
  }
  const guard = await requireAdmin(req);
  if ("error" in guard) {
    return json({ error: guard.error }, guard.status);
  }
  const { username, password } = await getBody<Payload>(req);
  const normalized = username?.trim().toLowerCase();
  if (!normalized || !password) {
    return json({ error: "Dati mancanti" }, 400);
  }

  const passwordHash = await hash(password);
  const { data, error } = await supabase
    .from("admin_users")
    .insert({ username: normalized, password_hash: passwordHash })
    .select("id, username, is_active, created_at")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  return json({ admin: data });
});
