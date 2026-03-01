import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { limit?: number };

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

  const { limit = 1000 } = await getBody<Payload>(req);
  const { data, error } = await supabase
    .from("test_results")
    .select("email")
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 5000));

  if (error) return json({ error: error.message }, 500);

  const counts = new Map<string, number>();
  (data ?? []).forEach((row: { email: string }) => {
    const email = row.email;
    counts.set(email, (counts.get(email) ?? 0) + 1);
  });

  const participants = Array.from(counts.entries())
    .map(([email, tests]) => ({ email, tests }))
    .sort((a, b) => b.tests - a.tests);

  return json({ participants });
});
