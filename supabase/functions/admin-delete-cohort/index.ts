import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = { id?: string };

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
  const { id } = await getBody<Payload>(req);
  if (!id) return json({ error: "ID mancante" }, 400);

  const { error } = await supabase.from("cohorts").delete().eq("id", id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
