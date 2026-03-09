"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkColor, setBulkColor] = useState<QuestionRow["color"] | "">("");
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState<QuestionRow["color"]>("blu");
  const [newShort, setNewShort] = useState(false);

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

  const handleCreateQuestion = async () => {
    const text = newText.trim();
    if (!text) return;
    setError(null);
    try {
      const { question } = await callAdminFunction<{
        question: QuestionRow;
      }>("admin-create-question", {
        text,
        color: newColor,
        is_short: newShort,
      });
      setQuestions((prev) =>
        [...prev, question].sort((a, b) => a.position - b.position),
      );
      setNewText("");
      setNewColor("blu");
      setNewShort(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore creazione");
    }
  };

  const handleDeleteQuestion = async (question: QuestionRow) => {
    const confirmDelete =
      typeof window === "undefined"
        ? true
        : window.confirm("Vuoi eliminare questa domanda?");
    if (!confirmDelete) return;
    setError(null);
    try {
      await callAdminFunction("admin-delete-question", { id: question.id });
      setQuestions((prev) => prev.filter((item) => item.id !== question.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(question.id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore eliminazione");
    }
  };

  const colorOptions = useMemo(
    () => [
      {
        id: "rosso",
        label: "Rosso",
        className: "bg-rose-500 text-white",
      },
      {
        id: "giallo",
        label: "Giallo",
        className: "bg-amber-400 text-amber-950",
      },
      {
        id: "verde",
        label: "Verde",
        className: "bg-emerald-500 text-white",
      },
      {
        id: "blu",
        label: "Blu",
        className: "bg-blue-500 text-white",
      },
    ],
    [],
  );

  const colorDotClass = (color: string) => {
    switch (color) {
      case "rosso":
        return "bg-rose-500";
      case "giallo":
        return "bg-amber-400";
      case "verde":
        return "bg-emerald-500";
      case "blu":
        return "bg-blue-500";
      default:
        return "bg-slate-300";
    }
  };

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

  const colorSummary = useMemo(() => {
    const base = {
      rosso: { full: 0, short: 0 },
      giallo: { full: 0, short: 0 },
      verde: { full: 0, short: 0 },
      blu: { full: 0, short: 0 },
    } as const;
    const summary = {
      rosso: { ...base.rosso },
      giallo: { ...base.giallo },
      verde: { ...base.verde },
      blu: { ...base.blu },
    };
    filteredQuestions.forEach((question) => {
      const color = (editColors[question.id] ?? question.color) as ColorKey;
      const isShort = editShort[question.id] ?? question.is_short;
      summary[color].full += 1;
      if (isShort) summary[color].short += 1;
    });
    return summary;
  }, [editColors, editShort, filteredQuestions]);

  type ColorKey = QuestionRow["color"];

  const allSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((question) => selectedIds.has(question.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filteredQuestions.map((question) => question.id)));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const applyBulkColor = () => {
    if (!bulkColor || selectedIds.size === 0) return;
    setEditColors((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = bulkColor;
      });
      return next;
    });
  };

  const applyBulkShort = (value: boolean) => {
    if (selectedIds.size === 0) return;
    setEditShort((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => {
        next[id] = value;
      });
      return next;
    });
  };

  const handleBulkSave = async () => {
    if (selectedIds.size === 0) return;
    setError(null);
    try {
      const updates = Array.from(selectedIds)
        .map((id) => {
          const question = questions.find((item) => item.id === id);
          if (!question) return null;
          return {
            id,
            text: editTexts[id] ?? question.text,
            color: editColors[id] ?? question.color,
            is_short: editShort[id] ?? question.is_short,
          };
        })
        .filter(Boolean);
      const { questions: updated } = await callAdminFunction<{
        questions: QuestionRow[];
      }>("admin-bulk-update-questions", { updates });
      setQuestions((prev) =>
        prev.map((item) => updated.find((u) => u.id === item.id) ?? item),
      );
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore salvataggio bulk");
    }
  };

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Elenco domande
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Modifica in stile foglio di calcolo, salva per riga.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{filteredQuestions.length} righe</span>
            </div>
          </div>
          <div className="mt-4">
            <input
              className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
              placeholder="Cerca per testo, id, colore o short..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto] md:items-start">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">
                Recap colori (full / short)
              </span>
              <div className="mt-2 grid grid-cols-[120px_repeat(2,80px)] items-center gap-2">
                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                  Colore
                </span>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                  Full
                </span>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">
                  Short
                </span>
                {colorOptions.map((option) => (
                  <div
                    key={option.id}
                    className="col-span-3 grid grid-cols-[120px_repeat(2,80px)] items-center gap-2"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${colorDotClass(option.id)}`}
                      />
                      {option.label}
                    </div>
                    <span className="text-xs text-slate-600">
                      {colorSummary[option.id as keyof typeof colorSummary].full}
                    </span>
                    <span className="text-xs text-slate-600">
                      {colorSummary[option.id as keyof typeof colorSummary].short}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {filteredQuestions.length} righe
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Nuova domanda</span>
            <input
              className="h-9 min-w-[240px] flex-1 rounded-md border border-slate-200 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Testo domanda"
              value={newText}
              onChange={(event) => setNewText(event.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${colorDotClass(newColor)}`} />
              <select
                className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                value={newColor}
                onChange={(event) =>
                  setNewColor(event.target.value as QuestionRow["color"])
                }
              >
                {colorOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={newShort}
                onChange={(event) => setNewShort(event.target.checked)}
              />
              Short
            </label>
            <Button size="sm" variant="outline" onClick={handleCreateQuestion}>
              Aggiungi
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">
              Bulk ({selectedIds.size})
            </span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              Seleziona tutto
            </label>
            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                value={bulkColor}
                onChange={(event) =>
                  setBulkColor(event.target.value as QuestionRow["color"] | "")
                }
              >
                <option value="">Colore...</option>
                {colorOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={applyBulkColor}
                disabled={!bulkColor || selectedIds.size === 0}
              >
                Applica colore
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyBulkShort(true)}
                disabled={selectedIds.size === 0}
              >
                Short ON
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyBulkShort(false)}
                disabled={selectedIds.size === 0}
              >
                Short OFF
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleBulkSave}
              disabled={selectedIds.size === 0}
            >
              Salva selezionate
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[940px] rounded-lg border border-slate-200">
              <div className="grid grid-cols-[50px_64px_70px_minmax(280px,1fr)_220px_120px_90px] items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span></span>
                <span>#</span>
                <span>Short</span>
                <span>Testo</span>
                <span>Colore</span>
                <span>Salva</span>
                <span>Elimina</span>
              </div>
              {filteredQuestions.map((question) => {
                const status = saveStatus[question.id];
                const selectedColor = editColors[question.id] ?? question.color;
                const selectedShort =
                  editShort[question.id] ?? question.is_short;
                return (
                  <div
                    key={question.id}
                    className="grid grid-cols-[50px_64px_70px_minmax(280px,1fr)_220px_120px_90px] items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
                  >
                    <label className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(question.id)}
                        onChange={() => toggleSelectOne(question.id)}
                      />
                    </label>
                    <div className="text-xs text-slate-500">
                      #{question.position}
                    </div>
                    <label className="flex items-center justify-center text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedShort}
                        onChange={(event) =>
                          setEditShort((prev) => ({
                            ...prev,
                            [question.id]: event.target.checked,
                          }))
                        }
                      />
                    </label>
                    <input
                      className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      value={editTexts[question.id] ?? question.text}
                      onChange={(event) =>
                        setEditTexts((prev) => ({
                          ...prev,
                          [question.id]: event.target.value,
                        }))
                      }
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${colorDotClass(selectedColor)}`}
                        aria-hidden="true"
                      />
                      <select
                        className="h-9 rounded-md border border-slate-200 px-3 text-sm"
                        value={selectedColor}
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
                    </div>
                    <div className="flex flex-col items-start gap-1 text-xs text-slate-500">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave(question)}
                        aria-label="Salva"
                      >
                        ✓
                      </Button>
                      {status === "saving" && <span>Salvataggio...</span>}
                      {status === "saved" && <span>Salvato</span>}
                      {status === "error" && <span>Errore</span>}
                    </div>
                    <div className="flex items-center justify-start">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteQuestion(question)}
                      >
                        Elimina
                      </Button>
                    </div>
                  </div>
                );
              })}
              {!loading && filteredQuestions.length === 0 && (
                <div className="px-3 py-4 text-xs text-slate-500">
                  Nessuna domanda trovata.
                </div>
              )}
              {loading && (
                <div className="px-3 py-4 text-xs text-slate-500">
                  Caricamento in corso...
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
