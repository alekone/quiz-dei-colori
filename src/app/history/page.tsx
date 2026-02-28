"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getTestResults,
  getTestResultsRemote,
  type TestResult,
} from "@/lib/storage";
import { isSupabaseEnabled } from "@/lib/supabaseClient";
import { colorMeta, quizVariants } from "@/lib/quiz";

export default function HistoryPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (isSupabaseEnabled) {
        const { results: remote, error } = await getTestResultsRemote();
        setResults(remote);
        setRemoteError(error ?? null);
      } else {
        setResults(getTestResults());
      }
    };
    void load();
  }, []);

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Storico dei test
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSupabaseEnabled
              ? `Storico condiviso (Supabase). Totale: ${results.length}`
              : `Salvataggi locali per questa postazione. Totale: ${results.length}`}
          </p>
          {remoteError && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              Errore Supabase: {remoteError}. Verifica policy di lettura o
              configurazione.
            </div>
          )}

          {results.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              Nessun test ancora completato.
              <div className="mt-4">
                <Button asChild>
                  <Link href="/test">Inizia un test</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {results.map((result) => {
                const dominantLabel = result.summary.balanced
                  ? "Profilo bilanciato"
                  : result.summary.coDominantColors.length > 1
                    ? `Co-dominanza: ${result.summary.coDominantColors
                        .map((color) => colorMeta[color].label)
                        .join(" · ")}`
                    : result.summary.topColor
                      ? colorMeta[result.summary.topColor].label
                      : "Risultato";
                const variantLabel = result.variant
                  ? quizVariants[result.variant].label
                  : quizVariants.full.label;
                const durationLabel = result.durationMs
                  ? `${Math.max(1, Math.round(result.durationMs / 60000))} min`
                  : null;
                return (
                  <div
                    key={result.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{dominantLabel}</Badge>
                        <span className="text-sm font-medium text-slate-900">
                          {result.email}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(result.createdAt).toLocaleString("it-IT")}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {variantLabel}
                        {durationLabel ? ` · ${durationLabel}` : ""}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/result?rid=${result.id}`}>
                        Apri risultato
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="text-xs text-slate-500">
          <Link href="/privacy" className="underline hover:text-slate-700">
            Informativa privacy
          </Link>{" "}
          ·{" "}
          <Link href="/diritti" className="underline hover:text-slate-700">
            Diritti GDPR
          </Link>
        </div>
      </main>
    </div>
  );
}
