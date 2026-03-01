"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callPublicFunction } from "@/lib/adminApi";
import { setAdminSession, type AdminSession } from "@/lib/adminSession";

type LoginResponse = AdminSession;

export default function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await callPublicFunction<LoginResponse>("admin-login", {
        username,
        password,
      });
      setAdminSession(session);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Login admin</h1>
          <p className="mt-2 text-sm text-slate-600">
            Accedi per gestire test, coorti e inviti.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleLogin}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
