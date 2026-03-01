import { Suspense } from "react";
import AdminClient from "./admin-client";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-5 py-10">
          <main className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Caricamento dashboard...
            </div>
          </main>
        </div>
      }
    >
      <AdminClient />
    </Suspense>
  );
}
