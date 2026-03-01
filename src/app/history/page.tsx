"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { callAdminFunction } from "@/lib/adminApi";
import { getAdminSession } from "@/lib/adminSession";
import { normalizeSummary, type TestResult } from "@/lib/storage";
import { colorMeta, quizVariants } from "@/lib/quiz";

type AdminTestRow = {
  id: string;
  email: string;
  created_at: string;
  started_at: string | null;
  duration_ms: number | null;
  variant: string | null;
  cohort: string | null;
  cohort_id: string | null;
  referrer_id: string | null;
  invite_code: string | null;
  unlock_at: string | null;
  unlocked_at: string | null;
  answers: Record<string, number> | string;
  summary: unknown;
  question_count: number;
};

export default function HistoryPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const session = getAdminSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      try {
        const { results: raw } = await callAdminFunction<{
          results: AdminTestRow[];
        }>("admin-list-tests");
        const mapped = raw.map((row) => {
          const answers =
            typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers;
          const summary =
            typeof row.summary === "string"
              ? JSON.parse(row.summary)
              : row.summary;
          return {
            id: row.id,
            email: row.email,
            createdAt: row.created_at,
            startedAt: row.started_at ?? undefined,
            durationMs: row.duration_ms ?? undefined,
            variant:
              row.variant === "short" ? "short" : row.variant ? "full" : undefined,
            cohort: row.cohort ?? undefined,
            cohortId: row.cohort_id ?? undefined,
            referrerId: row.referrer_id ?? undefined,
            inviteCode: row.invite_code ?? undefined,
            unlockAt: row.unlock_at ?? undefined,
            unlockedAt: row.unlocked_at ?? undefined,
            answers,
            summary: normalizeSummary(summary as object),
            questionCount: row.question_count,
          } as TestResult;
        });
        setResults(mapped);
        setRemoteError(null);
      } catch (error) {
        setRemoteError(
          error instanceof Error ? error.message : "Errore caricamento",
        );
      }
    };
    void load();
  }, [router]);

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
            Storico admin. Totale: {results.length}
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
