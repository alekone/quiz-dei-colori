import { Suspense } from "react";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-5 py-12">
          <main className="mx-auto flex w-full max-w-lg flex-col gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Caricamento login...
            </div>
          </main>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
