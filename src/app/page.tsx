import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-12 sm:px-8">
        <header className="flex flex-col gap-4">
          <Badge className="w-fit" variant="secondary">
            Test pubblico
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Test dei Colori della Personalità
          </h1>
          <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
            Un test rapido per scoprire il tuo colore dominante. Funziona da
            mobile, salva lo storico e genera un PDF dei risultati.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login?variant=full">Test completo (80)</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login?variant=short">Test rapido (20)</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/history">Vedi storico</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Accesso rapido",
              text: "Basta inserire l'email per iniziare.",
            },
            {
              title: "20 o 80 domande",
              text: "Versione rapida o completa con salvataggio automatico.",
            },
            {
              title: "PDF e invio",
              text: "Esporta il risultato e invialo via email.",
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
            Il test dei colori è un questionario che associa preferenze e
            comportamenti a quattro colori principali (rosso, giallo, verde,
            blu). È uno strumento orientativo per riflettere sul proprio stile,
            non una diagnosi clinica.
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
