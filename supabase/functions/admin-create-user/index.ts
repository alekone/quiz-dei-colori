import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { username?: string; password?: string };

Deno.serve(async (req) => {
  try {
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

    const { data, error } = await supabase.rpc("admin_create_user", {
      p_username: normalized,
      p_password: password,
    });
    const admin = Array.isArray(data) ? data[0] : data;

    if (error) return json({ error: error.message }, 500);
    return json({ admin });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Errore inatteso";
    return json({ error: message }, 500);
  }
});
