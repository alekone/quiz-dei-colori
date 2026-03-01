import { corsHeaders, json, requireAdmin, supabase } from "../_shared/admin.ts";

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

  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return json({ error: error.message }, 500);
  return json({ admins: data ?? [] });
});
