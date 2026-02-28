/* eslint-disable no-alert */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  checkRemoteDeletePermission,
  deleteTestResultsByEmail,
  deleteTestResultsRemoteByEmail,
  getTestResultsByEmail,
  getTestResultsRemoteByEmail,
  type TestResult,
} from "@/lib/storage";

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function DirittiPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [remoteDeleteAllowed, setRemoteDeleteAllowed] = useState(true);
  const [remoteDeleteError, setRemoteDeleteError] = useState<string | null>(null);

  const normalizedEmail = useMemo(
    () => email.trim().toLowerCase(),
    [email],
  );

  useEffect(() => {
    const check = async () => {
      const { allowed, error } = await checkRemoteDeletePermission();
      setRemoteDeleteAllowed(allowed);
      setRemoteDeleteError(error ?? null);
    };
    void check();
  }, []);

  const handleExport = async () => {
    if (!normalizedEmail) return;
    setIsWorking(true);
    setStatus(null);
    try {
      const localResults = getTestResultsByEmail(normalizedEmail);
      const { results: remoteResults, error } =
        await getTestResultsRemoteByEmail(normalizedEmail);
      if (error) {
        setStatus(`Errore Supabase: ${error}`);
      }
      const payload = {
        email: normalizedEmail,
        exportedAt: new Date().toISOString(),
        localResults,
        remoteResults,
      };
      downloadJson(`gdpr-export-${normalizedEmail}.json`, payload);
      setStatus("Export completato.");
    } finally {
      setIsWorking(false);
    }
  };

  const handleDeleteLocal = () => {
    if (!normalizedEmail) return;
    const deleted = deleteTestResultsByEmail(normalizedEmail);
    setStatus(`Dati locali eliminati: ${deleted} record.`);
  };

  const handleDeleteRemote = async () => {
    if (!normalizedEmail) return;
    setIsWorking(true);
    setStatus(null);
    const { deleted, error } = await deleteTestResultsRemoteByEmail(
      normalizedEmail,
    );
    if (error) {
      setStatus(`Errore Supabase: ${error}`);
    } else {
      setStatus(`Dati remoti eliminati: ${deleted} record.`);
    }
    setIsWorking(false);
  };

  const handleDeleteAll = async () => {
    if (!normalizedEmail) return;
    const ok = window.confirm(
      "Vuoi eliminare tutti i dati locali e remoti associati a questa email?",
    );
    if (!ok) return;
    handleDeleteLocal();
    await handleDeleteRemote();
  };

  return (
    <div className="min-h-screen px-5 py-12">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Diritti GDPR
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Qui puoi esportare o cancellare i tuoi dati associati a una email.
          </p>

          <div className="mt-6 space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@dominio.it"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {!remoteDeleteAllowed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                Cancellazione remota non disponibile: {remoteDeleteError}. Verifica
                le policy Supabase (DELETE) o la configurazione.
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleExport} disabled={!normalizedEmail || isWorking}>
                Esporta dati
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteLocal}
                disabled={!normalizedEmail || isWorking}
              >
                Cancella dati locali
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteRemote}
                disabled={!normalizedEmail || isWorking || !remoteDeleteAllowed}
              >
                Cancella dati remoti
              </Button>
              <Button
                variant="ghost"
                onClick={handleDeleteAll}
                disabled={!normalizedEmail || isWorking || !remoteDeleteAllowed}
              >
                Cancella tutto
              </Button>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              La cancellazione remota richiede che Supabase sia configurato e
              consenta le operazioni di delete.
            </div>
            {status && (
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                {status}
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
