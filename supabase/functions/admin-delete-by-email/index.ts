import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { email?: string };

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
  const { email } = await getBody<Payload>(req);
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return json({ error: "Email mancante" }, 400);

  const { data, error } = await supabase
    .from("test_results")
    .delete()
    .eq("email", normalized)
    .select("id");
  if (error) return json({ error: error.message }, 500);
  return json({ deleted: data?.length ?? 0 });
});
