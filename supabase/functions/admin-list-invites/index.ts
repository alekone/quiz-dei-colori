import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { cohortId?: string };

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
  const { cohortId } = await getBody<Payload>(req);

  let query = supabase
    .from("cohort_invites")
    .select("id, code, created_at, revoked_at, cohort_id, cohorts(name)")
    .order("created_at", { ascending: false });

  if (cohortId) {
    query = query.eq("cohort_id", cohortId);
  }

  const { data, error } = await query;
  if (error) return json({ error: error.message }, 500);
  return json({ invites: data ?? [] });
});
