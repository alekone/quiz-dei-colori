"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quizVariants, type QuizVariant } from "@/lib/quiz";
import { getUserCohort, setUserCohort, setUserEmail } from "@/lib/storage";
import { resolveInvite, setCohortInfo } from "@/lib/cohorts";

type LoginFormProps = {
  variant: QuizVariant;
  onContinue: (variant: QuizVariant) => void;
  refParam?: string | null;
  showVariantLabel?: boolean;
  submitLabel?: string;
};

export default function LoginForm({
  variant,
  onContinue,
  refParam,
  showVariantLabel = true,
  submitLabel = "Continua",
}: LoginFormProps) {
  const initialCohort = getUserCohort();
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState(() => initialCohort ?? "");
  const [consent, setConsent] = useState(false);
  const [cohortLocked, setCohortLocked] = useState(() => Boolean(initialCohort));

  useEffect(() => {
    if (!refParam) return;
    const run = async () => {
      try {
        const info = await resolveInvite(refParam);
        setCohortInfo(info);
        if (info.cohortName) {
          setCohort(info.cohortName);
          setCohortLocked(true);
        }
      } catch {
        // ignore invalid ref
      }
    };
    void run();
  }, [refParam]);

  const handleContinue = () => {
    if (!email.trim() || !consent) return;
    setUserEmail(email);
    setUserCohort(cohort);
    onContinue(variant);
  };

  return (
    <div className="space-y-3">
      {showVariantLabel && (
        <p className="text-xs text-slate-500">
          Versione selezionata: {quizVariants[variant].label}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nome@dominio.it"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cohort">Codice gruppo (opzionale)</Label>
        <Input
          id="cohort"
          type="text"
          placeholder="Es. team-marketing"
          value={cohort}
          onChange={(event) => setCohort(event.target.value)}
          disabled={cohortLocked}
        />
        <p className="text-xs text-slate-500">
          {cohortLocked
            ? "Coorte assegnata tramite invito."
            : "Utile per confrontare risultati per coorte senza dati personali."}
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
        {submitLabel}
      </Button>
      {!consent && (
        <p className="text-xs text-amber-600">
          Devi accettare l&apos;informativa privacy per continuare.
        </p>
      )}
    </div>
  );
}
