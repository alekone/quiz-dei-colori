import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
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

  const { id } = await getBody<Payload>(req);
  if (!id) return json({ error: "ID mancante" }, 400);

  const { data: row, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("position")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return json({ error: fetchError.message }, 500);
  if (!row?.position) {
    return json({ deleted: id });
  }

  const { error: deleteError } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", id);

  if (deleteError) return json({ error: deleteError.message }, 500);

  const { data: rowsToShift, error: shiftFetchError } = await supabase
    .from("quiz_questions")
    .select("id, position")
    .gt("position", row.position)
    .order("position", { ascending: true });

  if (shiftFetchError) return json({ error: shiftFetchError.message }, 500);

  for (const item of rowsToShift ?? []) {
    const { error: shiftError } = await supabase
      .from("quiz_questions")
      .update({
        position: Math.max(1, item.position - 1),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);
    if (shiftError) return json({ error: shiftError.message }, 500);
  }

  return json({ deleted: id });
});
