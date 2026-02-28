import { Suspense } from "react";
import ResultClient from "./result-client";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-5 py-10">
          <main className="mx-auto flex w-full max-w-lg flex-col gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Caricamento risultato...
            </div>
          </main>
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  );
}
