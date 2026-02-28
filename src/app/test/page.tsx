import { Suspense } from "react";
import TestClient from "./test-client";

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-5 py-10">
          <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Caricamento test...
            </div>
          </main>
        </div>
      }
    >
      <TestClient />
    </Suspense>
  );
}
