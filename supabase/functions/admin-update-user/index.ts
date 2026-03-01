import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
  id?: string;
  username?: string;
  isActive?: boolean;
  password?: string;
};

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
  const { id, username, isActive, password } = await getBody<Payload>(req);
  if (!id) return json({ error: "ID mancante" }, 400);

  const updates: Record<string, unknown> = {};
  if (typeof username === "string") {
    const normalized = username.trim().toLowerCase();
    if (!normalized) return json({ error: "Username non valido" }, 400);
    updates.username = normalized;
  }
  if (typeof isActive === "boolean") {
    updates.is_active = isActive;
  }
  if (typeof password === "string" && password.trim()) {
    updates.password_hash = await hash(password);
  }

  const { data, error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id)
    .select("id, username, is_active, created_at")
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  return json({ admin: data });
});
