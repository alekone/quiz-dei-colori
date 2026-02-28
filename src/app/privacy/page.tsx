import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-5 py-12">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Informativa privacy
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Questa informativa descrive come trattiamo i tuoi dati personali per
            il Test dei Colori della Personalità.
          </p>

          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Titolare del trattamento
              </h2>
              <p className="mt-1">
                Il titolare del trattamento è l&apos;organizzazione che gestisce
                questo sito. Per richieste: privacy@esempio.it.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Finalità del trattamento
              </h2>
              <ul className="mt-1 list-disc pl-5">
                <li>Fornire il test e mostrare il risultato.</li>
                <li>Salvare lo storico dei risultati (locale o Supabase).</li>
                <li>Generare report e statistiche aggregate anonime.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Base giuridica
              </h2>
              <p className="mt-1">
                Consenso esplicito dell&apos;utente al trattamento dei dati.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Dati trattati
              </h2>
              <ul className="mt-1 list-disc pl-5">
                <li>Email (per associare i risultati).</li>
                <li>Risposte e punteggi del test.</li>
                <li>Metadati tecnici: durata, versione, coorte opzionale.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Conservazione
              </h2>
              <p className="mt-1">
                I dati sono conservati finché l&apos;utente non richiede la
                cancellazione. Puoi eliminare i dati in qualsiasi momento.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Diritti dell&apos;interessato
              </h2>
              <p className="mt-1">
                Puoi esercitare i diritti di accesso, esportazione e
                cancellazione dei dati personali.
              </p>
              <p className="mt-2">
                Vai alla pagina{" "}
                <Link
                  href="/diritti"
                  className="text-slate-900 underline hover:text-slate-700"
                >
                  Diritti GDPR
                </Link>
                .
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
