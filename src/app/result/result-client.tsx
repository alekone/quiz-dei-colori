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
  const [shareStatus, setShareStatus] = useState<string | null>(null);

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

  const referralUrl = useMemo(() => {
    if (!result) return "";
    if (typeof window === "undefined") return "";
    const base = window.location.origin;
    const params = new URLSearchParams({
      ref: result.id,
      utm_source: "share",
      utm_medium: "referral",
      utm_campaign: "test_colori",
    });
    return `${base}/?${params.toString()}`;
  }, [result]);

  const shareText = useMemo(() => {
    if (!result) return "";
    const top = result.summary.topColor
      ? colorMeta[result.summary.topColor].label
      : result.summary.coDominantColors.length > 1
        ? `co-dominanza ${result.summary.coDominantColors
            .map((color) => colorMeta[color].label)
            .join(" · ")}`
        : "profilo bilanciato";
    return `Ho appena fatto il Test dei Colori: il mio risultato è ${top}. Vuoi scoprire il tuo?`;
  }, [result]);

  const createShareCard = async () => {
    if (!result) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const bg = "#0f172a";
    const accent = colorMeta[result.summary.topColor].accent;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 52px sans-serif";
    ctx.fillText("Test dei Colori della Personalità", 64, 120);

    const topLabel = colorMeta[result.summary.topColor].label;
    ctx.font = "bold 72px sans-serif";
    ctx.fillText(topLabel, 64, 220);

    const percent = result.summary.percentages[result.summary.topColor];
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`Colore dominante · ${percent}%`, 64, 270);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "26px sans-serif";
    ctx.fillText("Fai il test anche tu", 64, 340);

    ctx.fillStyle = accent;
    ctx.fillRect(64, 380, 420, 68);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("Inizia ora", 96, 425);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/png"),
    );
    if (!blob) return null;
    return new File([blob], "risultato-test-colori.png", {
      type: "image/png",
    });
  };

  const handleShare = async () => {
    if (!result) return;
    setShareStatus(null);
    try {
      if (navigator.share) {
        const card = await createShareCard();
        if (card && navigator.canShare?.({ files: [card] })) {
          await navigator.share({
            title: "Test dei Colori della Personalità",
            text: shareText,
            files: [card],
            url: referralUrl,
          });
        } else {
          await navigator.share({
            title: "Test dei Colori della Personalità",
            text: shareText,
            url: referralUrl,
          });
        }
        setShareStatus("Condivisione completata.");
        return;
      }
      await navigator.clipboard.writeText(referralUrl);
      setShareStatus("Link copiato negli appunti.");
    } catch (error) {
      console.error("Share error", error);
      setShareStatus("Condivisione annullata o non disponibile.");
    }
  };

  const handleCopyLink = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setShareStatus("Link copiato negli appunti.");
  };

  const handlePdf = () => {
    if (!result) return;
    const doc = new jsPDF();
    const maxWidth = 180;
    const lineHeight = 5;

    const addParagraph = (text: string, x: number, y: number) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * lineHeight;
    };
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

    if (result.summary.balanced) {
      doc.text("Profilo bilanciato", 14, startY + offset + 6);
    } else if (result.summary.coDominantColors.length > 1) {
      const label = result.summary.coDominantColors
        .map((color) => colorMeta[color].label)
        .join(" · ");
      doc.text(`Co-dominanza: ${label}`, 14, startY + offset + 6);
    } else if (result.summary.topColor) {
      doc.text(
        `Colore dominante: ${colorMeta[result.summary.topColor].label}`,
        14,
        startY + offset + 6,
      );
    }

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
      textY = addParagraph(meta.who, 14, textY + 6);

      doc.setFontSize(10);
      doc.text("Come funzioni", 14, textY + 6);
      doc.setFontSize(9);
      meta.how.forEach((item) => {
        textY = addParagraph(`- ${item}`, 14, textY + 11);
      });

      doc.setFontSize(10);
      doc.text("Punti di forza", 14, textY + 6);
      doc.setFontSize(9);
      meta.strengths.forEach((item) => {
        textY = addParagraph(`- ${item}`, 14, textY + 11);
      });

      doc.setFontSize(10);
      doc.text("Punti ciechi", 14, textY + 6);
      doc.setFontSize(9);
      meta.blindSpots.forEach((item) => {
        textY = addParagraph(`- ${item}`, 14, textY + 11);
      });

      doc.setFontSize(10);
      doc.text("Come trattare gli altri colori", 14, textY + 6);
      doc.setFontSize(9);
      meta.withOthers.forEach((item) => {
        textY = addParagraph(`- ${item}`, 14, textY + 11);
      });

      doc.setFontSize(10);
      doc.text("Sotto stress", 14, textY + 6);
      doc.setFontSize(9);
      textY = addParagraph(meta.stress, 14, textY + 11);
      textY = addParagraph(
        `Trappola relazionale: ${meta.stressTrap}`,
        14,
        textY + 4,
      );
      textY = addParagraph(
        `Segnale di allerta: ${meta.stressSignal}`,
        14,
        textY + 4,
      );

      textY += 6;
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

  const topMeta = result.summary.topColor
    ? colorMeta[result.summary.topColor]
    : null;
  const coDominantMetas = result.summary.coDominantColors.map(
    (color) => colorMeta[color],
  );
  const secondaryMeta = result.summary.secondaryColor
    ? colorMeta[result.summary.secondaryColor]
    : null;
  const zeroColors = result.summary.zeroColors;
  const primaryColors = result.summary.balanced
    ? []
    : result.summary.coDominantColors.length > 1
    ? result.summary.coDominantColors
    : result.summary.topColor
    ? [result.summary.topColor]
    : [];
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
            {result.summary.balanced ? (
              <>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Profilo bilanciato
                </h1>
                <p className="text-sm text-slate-600">
                  I tuoi punteggi sono molto vicini tra loro: non emerge un
                  colore dominante netto.
                </p>
              </>
            ) : result.summary.coDominantColors.length > 1 ? (
              <>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Co-dominanza:{" "}
                  {coDominantMetas.map((meta) => meta.label).join(" · ")}
                </h1>
                <p className="text-sm text-slate-600">
                  Due colori sono molto vicini tra loro: entrambi influenzano il
                  profilo in modo simile.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Colore dominante: {topMeta?.label}
                </h1>
                <p className="text-sm text-slate-600">
                  {topMeta?.description}
                </p>
              </>
            )}
            <p className="text-xs text-slate-500">
              Email: {result.email} · {formattedDate}
            </p>
            <p className="text-xs text-slate-500">
              Versione: {variantLabel}
              {durationLabel ? ` · Durata: ${durationLabel}` : ""}
              {result.cohort ? ` · Coorte: ${result.cohort}` : ""}
            </p>
            {zeroColors.length > 0 && (
              <p className="text-xs text-amber-600">
                Assenza di risposte per:{" "}
                {zeroColors.map((color) => colorMeta[color].label).join(", ")}.
              </p>
            )}
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
                      {percent}%
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

          <div className="mt-6 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Profili dettagliati
            </h2>
          </div>

          <div className="mt-4 space-y-6">
            {primaryColors.map((color) => {
              const meta = colorMeta[color];
              return (
                <div
                  key={color}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {meta.label}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {result.summary.percentages[color]}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{meta.who}</p>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-slate-700">
                        Come funzioni
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {meta.how.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-slate-700">
                        Punti di forza
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {meta.strengths.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-slate-700">
                        Punti ciechi
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {meta.blindSpots.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-slate-700">
                        Come trattare gli altri colori
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {meta.withOthers.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-slate-700">
                        Sotto stress
                      </h4>
                      <p className="mt-2 text-sm text-slate-600">
                        {meta.stress}
                      </p>
                      <p className="mt-3 text-sm text-slate-600">
                        <span className="font-semibold">
                          Trappola relazionale:
                        </span>{" "}
                        {meta.stressTrap}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold">
                          Segnale di allerta:
                        </span>{" "}
                        {meta.stressSignal}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {!result.summary.balanced &&
            result.summary.coDominantColors.length <= 1 &&
            secondaryMeta && (
              <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Influenza secondaria: {secondaryMeta.label}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {result.summary.percentages[result.summary.secondaryColor!]}%
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {secondaryMeta.description}
                </p>
              </div>
            )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={handlePdf}>Scarica PDF</Button>
            <Button variant="outline" onClick={handleEmail}>
              Invia via email
            </Button>
            <Button variant="outline" onClick={handleShare}>
              Condividi risultato
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
          {shareStatus && (
            <p className="mt-2 text-xs text-slate-500">{shareStatus}</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700">
            Invita amici
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Condividi il test con un link personale: aiuti i tuoi amici a
            scoprire il loro colore.
          </p>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
            {referralUrl}
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleCopyLink}>
              Copia link invito
            </Button>
            <Button onClick={handleShare}>Condividi</Button>
          </div>
          {shareStatus && (
            <p className="mt-2 text-xs text-slate-500">{shareStatus}</p>
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
