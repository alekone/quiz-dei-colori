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
  const nextPassword =
    typeof password === "string" && password.trim() ? password.trim() : null;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("admin_users").update(updates).eq("id", id);
    if (error) return json({ error: error.message }, 500);
  }

  if (nextPassword) {
    const { error } = await supabase.rpc("admin_set_password", {
      p_user_id: id,
      p_password: nextPassword,
    });
    if (error) return json({ error: error.message }, 500);
  }

  const { data } = await supabase
    .from("admin_users")
    .select("id, username, is_active, created_at")
    .eq("id", id)
    .maybeSingle();

  return json({ admin: data });
});
