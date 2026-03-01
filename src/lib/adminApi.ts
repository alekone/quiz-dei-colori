import { getAdminSession } from "./adminSession";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const functionUrl = (name: string) =>
  `${supabaseUrl.replace(/\/+$/, "")}/functions/v1/${name}`;

const baseHeaders = () => ({
  apikey: supabaseKey,
  "Content-Type": "application/json",
});

export const callAdminFunction = async <T>(
  name: string,
  body: unknown = {},
): Promise<T> => {
  const session = getAdminSession();
  const response = await fetch(functionUrl(name), {
    method: "POST",
    headers: {
      ...baseHeaders(),
      authorization: `Bearer ${supabaseKey}`,
      ...(session ? { "x-admin-token": session.token } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error((data as { error?: string })?.error ?? "Errore admin");
  }
  return data;
};

export const callPublicFunction = async <T>(
  name: string,
  body: unknown = {},
): Promise<T> => {
  const response = await fetch(functionUrl(name), {
    method: "POST",
    headers: {
      ...baseHeaders(),
      authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error((data as { error?: string })?.error ?? "Errore richiesta");
  }
  return data;
};
