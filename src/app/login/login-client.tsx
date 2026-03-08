"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import LoginForm from "@/components/login-form";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");
  const refParam = searchParams.get("ref");
  const variant = useMemo(
    () => (variantParam === "short" ? "short" : "full"),
    [variantParam],
  );

  const handleContinue = () => {
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
          <LoginForm
            variant={variant}
            refParam={refParam}
            onContinue={handleContinue}
            showVariantLabel
          />
        </Card>
      </main>
    </div>
  );
}
