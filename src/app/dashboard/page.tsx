/* eslint-disable no-nested-ternary */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { colorMeta, quizVariants, type Color, type QuizVariant } from "@/lib/quiz";
import {
  getTestResults,
  getTestResultsRemote,
  type TestResult,
} from "@/lib/storage";
import { isSupabaseEnabled } from "@/lib/supabaseClient";

type ColorCounts = Record<Color, number>;

const emptyColorCounts = (): ColorCounts => ({
  rosso: 0,
  giallo: 0,
  verde: 0,
  blu: 0,
});

export default function DashboardPage() {
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

  const stats = useMemo(() => {
    const total = results.length;
    const topColorCounts = emptyColorCounts();
    const variantCounts: Record<QuizVariant, number> = { full: 0, short: 0 };
    const averagePercentages = emptyColorCounts();
    let durationTotal = 0;
    let durationCount = 0;

    const cohortMap = new Map<
      string,
      { count: number; topColorCounts: ColorCounts }
    >();

    results.forEach((result) => {
      const variant = result.variant ?? "full";
      variantCounts[variant] += 1;
      topColorCounts[result.summary.topColor] += 1;

      (Object.keys(result.summary.percentages) as Color[]).forEach((color) => {
        averagePercentages[color] += result.summary.percentages[color];
      });

      if (result.durationMs) {
        durationTotal += result.durationMs;
        durationCount += 1;
      }

      if (result.cohort) {
        const entry =
          cohortMap.get(result.cohort) ?? {
            count: 0,
            topColorCounts: emptyColorCounts(),
          };
        entry.count += 1;
        entry.topColorCounts[result.summary.topColor] += 1;
        cohortMap.set(result.cohort, entry);
      }
    });

    const avgPercentages = emptyColorCounts();
    if (total > 0) {
      (Object.keys(avgPercentages) as Color[]).forEach((color) => {
        avgPercentages[color] = Math.round(averagePercentages[color] / total);
      });
    }

    const avgDuration =
      durationCount > 0 ? Math.round(durationTotal / durationCount) : null;

    const cohorts = Array.from(cohortMap.entries())
      .map(([cohort, data]) => ({
        cohort,
        count: data.count,
        topColorCounts: data.topColorCounts,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      total,
      topColorCounts,
      variantCounts,
      avgPercentages: avgPercentages,
      avgDuration,
      cohorts,
    };
  }, [results]);

  const formatDuration = (ms: number | null) => {
    if (!ms) return "n/d";
    const minutes = Math.max(1, Math.round(ms / 60000));
    return `${minutes} min`;
  };

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>

        <Card className="p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard analytics
            </h1>
            <p className="text-sm text-slate-600">
              Aggregati anonimi dai test completati.
            </p>
          </div>
          {remoteError && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              Errore Supabase: {remoteError}. Verifica policy di lettura o
              configurazione.
            </div>
          )}
        </Card>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">Test totali</h2>
            <div className="mt-3 text-3xl font-semibold text-slate-900">
              {stats.total}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Durata media
            </h2>
            <div className="mt-3 text-3xl font-semibold text-slate-900">
              {formatDuration(stats.avgDuration)}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Versioni usate
            </h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {(Object.keys(stats.variantCounts) as QuizVariant[]).map(
                (variant) => (
                  <div key={variant} className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {quizVariants[variant].label}
                    </Badge>
                    <span>{stats.variantCounts[variant]} test</span>
                  </div>
                ),
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Distribuzione colore dominante
            </h2>
            <div className="mt-4 space-y-3">
              {(Object.keys(colorMeta) as Color[]).map((color) => {
                const count = stats.topColorCounts[color];
                const percentage = stats.total
                  ? Math.round((count / stats.total) * 100)
                  : 0;
                return (
                  <div key={color} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{colorMeta[color].label}</span>
                      <span>
                        {count} · {percentage}%
                      </span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Benchmark medio (percentuali)
            </h2>
            <div className="mt-4 space-y-3">
              {(Object.keys(stats.avgPercentages) as Color[]).map((color) => (
                <div key={color} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{colorMeta[color].label}</span>
                    <span>{stats.avgPercentages[color]}%</span>
                  </div>
                  <Progress value={stats.avgPercentages[color]} />
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700">
            Coorti (top 6)
          </h2>
          {stats.cohorts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Nessuna coorte disponibile.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {stats.cohorts.map((cohort) => (
                <div
                  key={cohort.cohort}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {cohort.cohort}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {cohort.count} test
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(Object.keys(cohort.topColorCounts) as Color[]).map(
                      (color) => {
                        const count = cohort.topColorCounts[color];
                        const percentage = cohort.count
                          ? Math.round((count / cohort.count) * 100)
                          : 0;
                        return (
                          <div
                            key={color}
                            className="flex items-center justify-between text-xs text-slate-500"
                          >
                            <span>{colorMeta[color].label}</span>
                            <span>
                              {count} · {percentage}%
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
