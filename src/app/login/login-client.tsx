"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quizVariants } from "@/lib/quiz";
import { setUserCohort, setUserEmail } from "@/lib/storage";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");
  const variant = variantParam === "short" ? "short" : "full";
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState("");
  const [consent, setConsent] = useState(false);

  const handleContinue = () => {
    if (!email.trim() || !consent) return;
    setUserEmail(email);
    setUserCohort(cohort);
    router.push(`/test?variant=${variant}`);
  };

  return (
    <div className="min-h-screen px-5 py-12">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Accedi per iniziare il test
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Inserisci la tua email per iniziare il test.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Versione selezionata: {quizVariants[variant].label}
          </p>

          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@dominio.it"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <div className="space-y-2">
              <Label htmlFor="cohort">Codice gruppo (opzionale)</Label>
              <Input
                id="cohort"
                type="text"
                placeholder="Es. team-marketing"
                value={cohort}
                onChange={(event) => setCohort(event.target.value)}
              />
              <p className="text-xs text-slate-500">
                Utile per confrontare risultati per coorte senza dati personali.
              </p>
            </div>
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                Ho letto e accetto l&apos;{" "}
                <Link
                  href="/privacy"
                  className="text-slate-900 underline hover:text-slate-700"
                >
                  informativa privacy
                </Link>
                .
              </span>
            </label>
            <Button className="w-full" onClick={handleContinue}>
              Continua
            </Button>
            {!consent && (
              <p className="text-xs text-amber-600">
                Devi accettare l&apos;informativa privacy per continuare.
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
