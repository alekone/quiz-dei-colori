import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
  id?: string;
  text?: string;
  color?: string;
  is_short?: boolean;
};

const allowedColors = new Set(["rosso", "giallo", "verde", "blu"]);

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

  const { id, text, color, is_short } = await getBody<Payload>(req);
  if (!id) return json({ error: "ID mancante" }, 400);

  const updates: Record<string, unknown> = {};
  if (typeof text === "string") {
    const trimmed = text.trim();
    if (!trimmed) return json({ error: "Testo non valido" }, 400);
    updates.text = trimmed;
  }
  if (typeof color === "string") {
    const normalized = color.trim().toLowerCase();
    if (!allowedColors.has(normalized)) {
      return json({ error: "Colore non valido" }, 400);
    }
    updates.color = normalized;
  }
  if (typeof is_short === "boolean") {
    updates.is_short = is_short;
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("quiz_questions")
    .update(updates)
    .eq("id", id)
    .select("id, text, color, position, is_short, updated_at")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  return json({ question: data });
});
