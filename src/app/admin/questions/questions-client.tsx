"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { callAdminFunction } from "@/lib/adminApi";
import { clearAdminSession, getAdminSession } from "@/lib/adminSession";

type QuestionRow = {
  id: string;
  text: string;
  color: "rosso" | "giallo" | "verde" | "blu";
  position: number;
  is_short: boolean;
  updated_at: string;
};

export default function QuestionsClient() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getAdminSession>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const [editColors, setEditColors] = useState<Record<string, string>>({});
  const [editShort, setEditShort] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsMounted(true);
    setSession(getAdminSession());
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!session) {
      router.replace("/admin/login");
    }
  }, [router, session, isMounted]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { questions: data } = await callAdminFunction<{
        questions: QuestionRow[];
      }>("admin-list-questions");
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      void loadQuestions();
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      await callAdminFunction("admin-logout");
    } catch {
      // ignore
    }
    clearAdminSession();
    router.replace("/admin/login");
  };

  const handleSave = async (question: QuestionRow) => {
    const text = editTexts[question.id] ?? question.text;
    const color = editColors[question.id] ?? question.color;
    const is_short = editShort[question.id] ?? question.is_short;
    setSaveStatus((prev) => ({ ...prev, [question.id]: "saving" }));
    try {
      const { question: updated } = await callAdminFunction<{
        question: QuestionRow;
      }>("admin-update-question", { id: question.id, text, color, is_short });
      setQuestions((prev) =>
        prev.map((item) => (item.id === question.id ? updated : item)),
      );
      setSaveStatus((prev) => ({ ...prev, [question.id]: "saved" }));
      window.setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [question.id]: "" }));
      }, 1500);
    } catch (err) {
      setSaveStatus((prev) => ({ ...prev, [question.id]: "error" }));
      setError(err instanceof Error ? err.message : "Errore salvataggio");
    }
  };

  const colorOptions = useMemo(
    () => [
      { id: "rosso", label: "Rosso" },
      { id: "giallo", label: "Giallo" },
      { id: "verde", label: "Verde" },
      { id: "blu", label: "Blu" },
    ],
    [],
  );

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return questions;
    return questions.filter((question) => {
      const text = question.text.toLowerCase();
      const color = question.color.toLowerCase();
      const id = question.id.toLowerCase();
      const position = String(question.position);
      const shortLabel = question.is_short ? "short" : "full";
      return (
        text.includes(query) ||
        color.includes(query) ||
        id.includes(query) ||
        position.includes(query) ||
        shortLabel.includes(query)
      );
    });
  }, [questions, search]);

  if (!isMounted || !session) {
    return null;
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              ← Torna all&apos;admin
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Domande quiz
            </h1>
            <p className="text-sm text-slate-600">
              Modifica testo e colore di ogni domanda.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadQuestions} disabled={loading}>
              Aggiorna elenco
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700">Elenco domande</h2>
          <p className="mt-2 text-xs text-slate-500">
            Le modifiche vengono salvate singolarmente.
          </p>
          <div className="mt-4">
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="Cerca per testo, id, colore o short..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="mt-4 space-y-4">
            {filteredQuestions.map((question) => {
              const status = saveStatus[question.id];
              return (
                <div
                  key={question.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{question.position}</Badge>
                      <Badge variant="outline">{question.id}</Badge>
                      {question.is_short && (
                        <Badge variant="secondary">Short</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {status === "saving" && <span>Salvataggio...</span>}
                      {status === "saved" && <span>Salvato</span>}
                      {status === "error" && <span>Errore</span>}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(question)}
                      >
                        Salva
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_160px]">
                    <textarea
                      className="min-h-[72px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      value={editTexts[question.id] ?? question.text}
                      onChange={(event) =>
                        setEditTexts((prev) => ({
                          ...prev,
                          [question.id]: event.target.value,
                        }))
                      }
                    />
                    <div className="flex flex-col gap-2">
                      <select
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                        value={editColors[question.id] ?? question.color}
                        onChange={(event) =>
                          setEditColors((prev) => ({
                            ...prev,
                            [question.id]: event.target.value,
                          }))
                        }
                      >
                        {colorOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={editShort[question.id] ?? question.is_short}
                          onChange={(event) =>
                            setEditShort((prev) => ({
                              ...prev,
                              [question.id]: event.target.checked,
                            }))
                          }
                        />
                        Includi nella versione short
                      </label>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Aggiornato:{" "}
                    {new Date(question.updated_at).toLocaleString("it-IT")}
                  </p>
                </div>
              );
            })}
            {!loading && filteredQuestions.length === 0 && (
              <p className="text-xs text-slate-500">
                Nessuna domanda trovata.
              </p>
            )}
            {loading && (
              <p className="text-xs text-slate-500">Caricamento in corso...</p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
