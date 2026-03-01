import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
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
  const { name, unlockDelayMinutes = 0 } = await getBody<Payload>(req);
  const trimmed = name?.trim();
  if (!trimmed) return json({ error: "Nome mancante" }, 400);

  const { data, error } = await supabase
    .from("cohorts")
    .insert({
      name: trimmed,
      unlock_delay_minutes: Math.max(0, Math.round(unlockDelayMinutes)),
    })
    .select("*")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  return json({ cohort: data });
});
