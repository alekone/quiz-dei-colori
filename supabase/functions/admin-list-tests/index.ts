import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
  limit?: number;
  offset?: number;
  email?: string;
  cohortId?: string;
  id?: string;
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

  const { limit = 200, offset = 0, email, cohortId, id } =
    await getBody<Payload>(req);
  let query = supabase
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + Math.min(limit, 500) - 1);

  if (id) {
    query = query.eq("id", id);
  }
  if (email) {
    query = query.eq("email", email.trim().toLowerCase());
  }
  if (cohortId) {
    query = query.eq("cohort_id", cohortId);
  }

  const { data, error } = await query;
  if (error) {
    return json({ error: error.message }, 500);
  }
  return json({ results: data ?? [] });
});
