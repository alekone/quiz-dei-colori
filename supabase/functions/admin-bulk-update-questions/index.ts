import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type UpdateItem = {
  id: string;
  text?: string;
  color?: string;
  is_short?: boolean;
};

type Payload = {
  updates?: UpdateItem[];
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

  const { updates } = await getBody<Payload>(req);
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return json({ error: "Nessun aggiornamento" }, 400);
  }

  const results: UpdateItem[] = [];
  for (const item of updates) {
    if (!item?.id) {
      return json({ error: "ID mancante" }, 400);
    }
    const update: Record<string, unknown> = {};
    if (typeof item.text === "string") {
      const trimmed = item.text.trim();
      if (!trimmed) return json({ error: "Testo non valido" }, 400);
      update.text = trimmed;
    }
    if (typeof item.color === "string") {
      const normalized = item.color.trim().toLowerCase();
      if (!allowedColors.has(normalized)) {
        return json({ error: "Colore non valido" }, 400);
      }
      update.color = normalized;
    }
    if (typeof item.is_short === "boolean") {
      update.is_short = item.is_short;
    }
    if (Object.keys(update).length === 0) {
      continue;
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("quiz_questions")
      .update(update)
      .eq("id", item.id)
      .select("id, text, color, position, is_short, updated_at")
      .maybeSingle();

    if (error || !data) {
      return json({ error: error?.message ?? "Errore aggiornamento" }, 500);
    }
    results.push(data);
  }

  return json({ questions: results });
});
