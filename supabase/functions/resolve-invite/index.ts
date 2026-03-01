import { corsHeaders, getBody, json, supabase } from "../_shared/admin.ts";

type Payload = { code?: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Metodo non consentito" }, 405);
  }
  const { code } = await getBody<Payload>(req);
  const trimmed = code?.trim().toUpperCase();
  if (!trimmed) return json({ error: "Codice mancante" }, 400);

  const { data, error } = await supabase
    .from("cohort_invites")
    .select(
      "id, code, cohort_id, revoked_at, cohorts(name, unlock_delay_minutes)",
    )
    .eq("code", trimmed)
    .maybeSingle();

  if (error || !data || data.revoked_at) {
    return json({ error: "Invito non valido" }, 404);
  }

  const cohort = (data as { cohorts?: { name?: string; unlock_delay_minutes?: number } })
    .cohorts;

  return json({
    inviteCode: data.code,
    cohortId: data.cohort_id,
    cohortName: cohort?.name ?? null,
    unlockDelayMinutes: cohort?.unlock_delay_minutes ?? 0,
  });
});
