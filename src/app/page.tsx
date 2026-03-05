import Link from "next/link";
import { Suspense } from "react";
import ReferralCapture from "@/components/referral-capture";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuadrantChart } from "@/components/quadrant-chart";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 py-12 sm:px-8">
        <header className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="flex flex-col gap-5">
            <Badge className="w-fit" variant="secondary">
              Test pubblico
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Scopri il tuo colore dominante in pochi minuti.
            </h1>
            <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
              Un test essenziale, progettato per mobile. Risultato immediato,
              PDF incluso, con privacy chiara.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login?variant=full">Inizia il test completo</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login?variant=short">Test rapido (20)</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>2–8 minuti</span>
              <span>20 o 80 domande</span>
              <span>PDF scaricabile</span>
              <span>GDPR ready</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <Link href="/dashboard" className="underline hover:text-slate-700">
                Dashboard
              </Link>
              <Link href="/admin/login" className="underline hover:text-slate-700">
                Admin
              </Link>
            </div>
          </div>

          <Card className="border-slate-200 p-6 shadow-none">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Anteprima risultato</span>
              <span>PDF pronto</span>
            </div>
            <div className="mt-4 space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                Colore dominante: Rosso
              </h2>
              <p className="text-sm text-slate-600">
                Profilo orientato all’azione, decisionale e concreto.
              </p>
              <div className="rounded-lg border border-slate-200 p-3">
                <QuadrantChart
                  percentages={{ rosso: 78, giallo: 54, verde: 41, blu: 33 }}
                  size={220}
                />
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Rosso</span>
                  <span>78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Giallo</span>
                  <span>54%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verde</span>
                  <span>41%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Blu</span>
                  <span>33%</span>
                </div>
              </div>
            </div>
          </Card>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Chiaro e veloce",
              text: "Inserisci l’email, rispondi e ottieni il risultato.",
            },
            {
              title: "Due versioni",
              text: "20 domande rapide o 80 complete con salvataggio.",
            },
            {
              title: "Output condivisibile",
              text: "Scarica il PDF e condividi con il tuo team.",
            },
          ].map((item) => (
            <Card key={item.title} className="p-5">
              <h3 className="text-base font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </Card>
          ))}
        </section>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Cos'è il test dei colori
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Associa preferenze e comportamenti a quattro colori principali. È
            uno strumento orientativo per riflettere sul proprio stile, non una
            diagnosi clinica.
          </p>
          <div className="mt-4 text-sm text-slate-600">
            Quadranti: Riflessivo · Entusiasta · Preciso · Concreto
          </div>
          <div className="mt-4 text-xs text-slate-500">
            <Link href="/privacy" className="underline hover:text-slate-700">
              Informativa privacy
            </Link>{" "}
            ·{" "}
            <Link href="/diritti" className="underline hover:text-slate-700">
              Diritti GDPR
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
