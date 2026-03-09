import { corsHeaders, getBody, json, requireAdmin, supabase } from "../_shared/admin.ts";

type Payload = {
  text?: string;
  color?: string;
  is_short?: boolean;
  position?: number;
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

  const { text, color, is_short, position } = await getBody<Payload>(req);
  const normalizedText = text?.trim();
  const normalizedColor = color?.trim().toLowerCase();
  if (!normalizedText) return json({ error: "Testo mancante" }, 400);
  if (!normalizedColor || !allowedColors.has(normalizedColor)) {
    return json({ error: "Colore non valido" }, 400);
  }

  const { data, error } = await supabase.rpc("admin_insert_question", {
    p_text: normalizedText,
    p_color: normalizedColor,
    p_is_short: Boolean(is_short),
    p_position: typeof position === "number" ? Math.max(1, Math.round(position)) : null,
  });

  const question = Array.isArray(data) ? data[0] : data;
  if (error || !question) {
    return json({ error: error?.message ?? "Errore creazione" }, 500);
  }
  return json({ question });
});
