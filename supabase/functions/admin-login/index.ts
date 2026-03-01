import {
  corsHeaders,
  generateToken,
  getBody,
  json,
  sha256Hex,
  supabase,
} from "../_shared/admin.ts";

type LoginPayload = {
  username?: string;
  password?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Metodo non consentito" }, 405);
  }

  const { username, password } = await getBody<LoginPayload>(req);
  const normalized = username?.trim().toLowerCase();
  if (!normalized || !password) {
    return json({ error: "Credenziali mancanti" }, 400);
  }

  const { data, error } = await supabase.rpc("admin_authenticate", {
    p_username: normalized,
    p_password: password,
  });

  const admin = Array.isArray(data) ? data[0] : data;

  if (error || !admin || !admin.is_active) {
    return json({ error: "Credenziali non valide" }, 401);
  }

  const token = generateToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const { error: insertError } = await supabase.from("admin_sessions").insert({
    admin_user_id: admin.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (insertError) {
    return json({ error: "Errore sessione" }, 500);
  }

  return json({
    token,
    expiresAt: expiresAt.toISOString(),
    adminUser: { id: admin.id, username: admin.username },
  });
});
