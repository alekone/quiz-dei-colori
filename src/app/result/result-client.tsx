"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuadrantChart } from "@/components/quadrant-chart";
import { colorMeta, quizVariants, type Color } from "@/lib/quiz";
import { getTestResultById, type TestResult } from "@/lib/storage";

export default function ResultClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get("rid");
  const [result, setResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (!resultId) return;
    const stored = getTestResultById(resultId);
    if (!stored) {
      router.replace("/test");
      return;
    }
    setResult(stored);
  }, [resultId, router]);

  const formattedDate = useMemo(() => {
    if (!result) return "";
    return new Date(result.createdAt).toLocaleString("it-IT");
  }, [result]);

  const handlePdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Test dei Colori della Personalità", 14, 20);
    doc.setFontSize(12);
    doc.text(`Email: ${result.email}`, 14, 30);
    doc.text(`Data: ${formattedDate}`, 14, 38);
    doc.text(`Domande: ${result.questionCount}`, 14, 46);
    if (result.variant) {
      doc.text(
        `Versione: ${quizVariants[result.variant].label}`,
        14,
        54,
      );
    }
    if (result.durationMs) {
      const durationMin = Math.max(
        1,
        Math.round(result.durationMs / 60000),
      );
      doc.text(`Durata: ${durationMin} min`, 14, 62);
    }

    const startY = 76;
    let offset = 0;
    (Object.keys(result.summary.scores) as Color[]).forEach((color) => {
      const meta = colorMeta[color];
      const score = result.summary.scores[color];
      const percent = result.summary.percentages[color];
      doc.text(
        `${meta.label}: ${score} punti (${percent}%)`,
        14,
        startY + offset,
      );
      offset += 8;
    });

    doc.text(
      `Colore dominante: ${colorMeta[result.summary.topColor].label}`,
      14,
      startY + offset + 6,
    );

    const chartTop = startY + offset + 16;
    const chartSize = 70;
    const chartLeft = 14;
    const center = chartLeft + chartSize / 2;
    const axis = chartSize * 0.42;
    const scale = axis / 100;

    doc.setDrawColor(203, 213, 245);
    doc.line(center, chartTop + 6, center, chartTop + chartSize - 6);
    doc.line(
      chartLeft + 6,
      chartTop + chartSize / 2,
      chartLeft + chartSize - 6,
      chartTop + chartSize / 2,
    );

    doc.setDrawColor(15, 23, 42);
    doc.rect(chartLeft, chartTop, chartSize, chartSize);

    const pointFor = (color: Color) => {
      const value = result.summary.percentages[color];
      const delta = value * scale;
      switch (color) {
        case "giallo":
          return { x: center - delta, y: chartTop + chartSize / 2 - delta };
        case "verde":
          return { x: center + delta, y: chartTop + chartSize / 2 - delta };
        case "rosso":
          return { x: center - delta, y: chartTop + chartSize / 2 + delta };
        case "blu":
          return { x: center + delta, y: chartTop + chartSize / 2 + delta };
      }
    };

    const entusiasta = pointFor("giallo");
    const riflessivo = pointFor("verde");
    const preciso = pointFor("blu");
    const concreto = pointFor("rosso");

    doc.setDrawColor(15, 23, 42);
    doc.lines(
      [
        [riflessivo.x - entusiasta.x, riflessivo.y - entusiasta.y],
        [preciso.x - riflessivo.x, preciso.y - riflessivo.y],
        [concreto.x - preciso.x, concreto.y - preciso.y],
        [entusiasta.x - concreto.x, entusiasta.y - concreto.y],
      ],
      entusiasta.x,
      entusiasta.y,
    );

    doc.setFillColor(245, 158, 11);
    doc.circle(entusiasta.x, entusiasta.y, 1.5, "F");
    doc.setFillColor(34, 197, 94);
    doc.circle(riflessivo.x, riflessivo.y, 1.5, "F");
    doc.setFillColor(59, 130, 246);
    doc.circle(preciso.x, preciso.y, 1.5, "F");
    doc.setFillColor(239, 68, 68);
    doc.circle(concreto.x, concreto.y, 1.5, "F");

    doc.setFontSize(10);
    doc.text("Emozioni", center, chartTop - 2, { align: "center" });
    doc.text("Logica", center, chartTop + chartSize + 8, { align: "center" });
    doc.text("Azione", chartLeft - 2, chartTop + chartSize / 2, {
      align: "right",
      baseline: "middle",
    });
    doc.text(
      "Riflessione",
      chartLeft + chartSize + 2,
      chartTop + chartSize / 2,
      { align: "left", baseline: "middle" },
    );

    let textY = chartTop + chartSize + 18;
    (Object.keys(result.summary.scores) as Color[]).forEach((color) => {
      const meta = colorMeta[color];
      doc.setFontSize(11);
      doc.text(meta.label, 14, textY);
      doc.setFontSize(9);
      doc.text(meta.description, 14, textY + 6, { maxWidth: 180 });
      textY += 16;
    });

    doc.save(`test-colori-${result.id}.pdf`);
  };

  const handleEmail = () => {
    if (!result) return;
    const top = colorMeta[result.summary.topColor].label;
    const summaryLines = (Object.keys(result.summary.scores) as Color[])
      .map((color) => {
        const meta = colorMeta[color];
        const score = result.summary.scores[color];
        const percent = result.summary.percentages[color];
        return `${meta.label}: ${score} (${percent}%)`;
      })
      .join("%0D%0A");

    const subject = encodeURIComponent(
      "Risultato Test dei Colori della Personalità",
    );
    const body = `Ciao,%0D%0A%0D%0AIl tuo risultato:%0D%0A${summaryLines}%0D%0A%0D%0AColore dominante: ${top}%0D%0A%0D%0A(In locale il PDF viene scaricato sul dispositivo.)`;
    window.location.href = `mailto:${result.email}?subject=${subject}&body=${body}`;
  };

  if (!result) {
    return (
      <div className="min-h-screen px-5 py-10">
        <main className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <Card className="p-6 text-center text-sm text-slate-600">
            Caricamento risultato...
          </Card>
        </main>
      </div>
    );
  }

  const topMeta = colorMeta[result.summary.topColor];
  const variantLabel = result.variant
    ? quizVariants[result.variant].label
    : quizVariants.full.label;
  const durationLabel = result.durationMs
    ? `${Math.max(1, Math.round(result.durationMs / 60000))} min`
    : null;

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>

        <Card className="p-6">
          <div className="flex flex-col gap-2">
            <Badge className="w-fit" variant="secondary">
              Risultato completo
            </Badge>
            <h1 className="text-2xl font-semibold text-slate-900">
              Colore dominante: {topMeta.label}
            </h1>
            <p className="text-sm text-slate-600">{topMeta.description}</p>
            <p className="text-xs text-slate-500">
              Email: {result.email} · {formattedDate}
            </p>
            <p className="text-xs text-slate-500">
              Versione: {variantLabel}
              {durationLabel ? ` · Durata: ${durationLabel}` : ""}
              {result.cohort ? ` · Coorte: ${result.cohort}` : ""}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(Object.keys(result.summary.scores) as Color[]).map((color) => {
              const meta = colorMeta[color];
              const score = result.summary.scores[color];
              const percent = result.summary.percentages[color];
              return (
                <div
                  key={color}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{meta.label}</h2>
                    <span className="text-xs text-slate-500">
                      {score} punti
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={percent} />
                    <p className="mt-2 text-xs text-slate-500">{percent}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Mappa dei quadranti
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Nord: Emozioni · Sud: Logica · Ovest: Azione · Est: Riflessione
            </p>
            <div className="mt-4 flex justify-center">
              <QuadrantChart percentages={result.summary.percentages} size={300} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(Object.keys(result.summary.scores) as Color[]).map((color) => {
              const meta = colorMeta[color];
              return (
                <div
                  key={color}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {meta.label}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {result.summary.percentages[color]}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {meta.description}
                  </p>
                  <ul className="mt-2 text-sm text-slate-600">
                    {meta.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={handlePdf}>Scarica PDF</Button>
            <Button variant="outline" onClick={handleEmail}>
              Invia via email
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                router.push(`/test?variant=${result.variant ?? "full"}`)
              }
            >
              Nuovo test
            </Button>
          </div>
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
