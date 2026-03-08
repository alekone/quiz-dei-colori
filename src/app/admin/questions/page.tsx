import { Suspense } from "react";
import QuestionsClient from "./questions-client";

export default function AdminQuestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-5 py-10">
          <main className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Caricamento domande...
            </div>
          </main>
        </div>
      }
    >
      <QuestionsClient />
    </Suspense>
  );
}
