import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
  id?: string;
  name?: string;
  unlockDelayMinutes?: number;
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
  const { id, name, unlockDelayMinutes } = await getBody<Payload>(req);
  if (!id) return json({ error: "ID mancante" }, 400);

  const updates: Record<string, unknown> = {};
  if (typeof name === "string") {
    const trimmed = name.trim();
    if (!trimmed) return json({ error: "Nome non valido" }, 400);
    updates.name = trimmed;
  }
  if (typeof unlockDelayMinutes === "number") {
    updates.unlock_delay_minutes = Math.max(0, Math.round(unlockDelayMinutes));
  }

  const { data, error } = await supabase
    .from("cohorts")
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  return json({ cohort: data });
});
