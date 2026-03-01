import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { cohortId?: string; code?: string };

const generateCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buffer = new Uint8Array(8);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
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
  const { cohortId, code } = await getBody<Payload>(req);
  if (!cohortId) return json({ error: "Cohort ID mancante" }, 400);

  let inviteCode = code?.trim().toUpperCase() || generateCode();
  for (let i = 0; i < 3; i += 1) {
    const { data, error } = await supabase
      .from("cohort_invites")
      .insert({ cohort_id: cohortId, code: inviteCode })
      .select("id, code, created_at, revoked_at, cohort_id")
      .maybeSingle();
    if (!error) {
      return json({ invite: data });
    }
    inviteCode = generateCode();
  }

  return json({ error: "Impossibile creare invito" }, 500);
});
