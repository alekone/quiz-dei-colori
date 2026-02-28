"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getQuestionsForVariant,
  quizVariants,
  scoreAnswers,
  type QuizVariant,
} from "@/lib/quiz";
import {
  clearTestDraft,
  clearReferrerId,
  getTestDraftForEmail,
  getReferrerId,
  getUserCohort,
  getUserEmail,
  saveTestDraft,
  saveTestResult,
  saveTestResultRemote,
  type TestDraft,
  type TestResult,
} from "@/lib/storage";
import { QuadrantChart } from "@/components/quadrant-chart";

export default function TestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");
  const variant: QuizVariant = variantParam === "short" ? "short" : "full";
  const questionSet = useMemo(
    () => getQuestionsForVariant(variant),
    [variant],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [draft, setDraft] = useState<TestDraft | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [lastBreakAt, setLastBreakAt] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | "none">("none");
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [enterOffset, setEnterOffset] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const lastSwipeDir = useRef<"left" | "right" | "none">("none");
  const currentQuestion = questionSet[currentIndex];
  const selectedWeight = answers[currentQuestion.id];

  useEffect(() => {
    const email = getUserEmail();
    if (!email) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const email = getUserEmail();
    const existing = email ? getTestDraftForEmail(email) : null;
    if (
      existing &&
      existing.variant === variant &&
      Object.keys(existing.answers).length > 0
    ) {
      setDraft(existing);
    } else {
      setDraft(null);
    }
    setAnswers({});
    setCurrentIndex(0);
    setHasStarted(false);
    setStartedAt(new Date().toISOString());
    setLastBreakAt(null);
  }, [variant]);

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questionSet.length) * 100);

  const missingCount = questionSet.length - answeredCount;
  const isLast = currentIndex === questionSet.length - 1;
  const canSubmit = answeredCount === questionSet.length;
  const remainingCount = questionSet.length - answeredCount;
  const estimatedMinutes = Math.max(1, Math.ceil((remainingCount * 20) / 60));
  const showSaved =
    savedAt !== null && Date.now() - savedAt < 1500;
  const showBreak =
    answeredCount > 0 &&
    answeredCount % 20 === 0 &&
    answeredCount !== lastBreakAt &&
    !isLast;

  const handleNext = () => {
    if (isLast) return;
    setCurrentIndex((prev) => Math.min(prev + 1, questionSet.length - 1));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const finishWithAnswers = (nextAnswers: Record<string, number>) => {
    const email = getUserEmail() ?? "utente@demo.test";
    const summary = scoreAnswers(nextAnswers, questionSet);
    const durationMs = Math.max(
      0,
      Date.now() - new Date(startedAt).getTime(),
    );
    const referrerId = getReferrerId() ?? undefined;
    const result: TestResult = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      email,
      createdAt: new Date().toISOString(),
      startedAt,
      durationMs,
      variant,
      cohort: getUserCohort() ?? undefined,
      referrerId,
      answers: nextAnswers,
      summary,
      questionCount: questionSet.length,
    };
    saveTestResult(result);
    void saveTestResultRemote(result);
    clearTestDraft();
    clearReferrerId();
    router.push(`/result?rid=${result.id}`);
  };

  const commitAnswer = (
    weight: number,
    options: { autoAdvance?: boolean } = {},
  ) => {
    if (!hasStarted && draft) {
      clearTestDraft();
      setDraft(null);
      setStartedAt(new Date().toISOString());
    }
    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: weight,
    };
    setAnswers(nextAnswers);
    setHasStarted(true);
    setSavedAt(Date.now());

    if (options.autoAdvance) {
      lastSwipeDir.current = weight === 1 ? "right" : "left";
      if (isLast) {
        if (Object.keys(nextAnswers).length === questionSet.length) {
          finishWithAnswers(nextAnswers);
        }
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, questionSet.length - 1));
      }
    }
  };

  const summaryPreview = useMemo(() => {
    if (!answeredCount) return null;
    return scoreAnswers(answers, questionSet);
  }, [answeredCount, answers, questionSet]);

  const handleFinish = () => {
    if (!canSubmit) return;
    finishWithAnswers(answers);
  };

  useEffect(() => {
    if (!hasStarted) return;
    const email = getUserEmail();
    if (!email) return;
    saveTestDraft({
      email,
      variant,
      currentIndex,
      answers,
      startedAt,
      updatedAt: new Date().toISOString(),
    });
  }, [answers, currentIndex, hasStarted, startedAt, variant]);

  useEffect(() => {
    if (lastSwipeDir.current === "none") return;
    const direction = lastSwipeDir.current;
    const offset = direction === "left" ? 60 : -60;
    setIsEntering(true);
    setEnterOffset(offset);
    const frame = window.requestAnimationFrame(() => {
      setIsEntering(false);
      setEnterOffset(0);
    });
    lastSwipeDir.current = "none";
    return () => window.cancelAnimationFrame(frame);
  }, [currentQuestion.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (["1", "2", "y", "n"].includes(key)) {
        event.preventDefault();
        const weight = key === "1" || key === "y" ? 1 : 0;
        commitAnswer(weight);
        return;
      }

      if (key === "enter" || key === " ") {
        event.preventDefault();
        if (selectedWeight === undefined) return;
        if (isLast) {
          if (canSubmit) handleFinish();
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    canSubmit,
    currentQuestion.id,
    handleFinish,
    handleNext,
    isLast,
    selectedWeight,
  ]);

  const handleResume = () => {
    if (!draft) return;
    setAnswers(draft.answers);
    setCurrentIndex(Math.min(draft.currentIndex, questionSet.length - 1));
    setStartedAt(draft.startedAt);
    setHasStarted(true);
    setSavedAt(null);
  };

  const handleRestart = () => {
    clearTestDraft();
    setDraft(null);
    setAnswers({});
    setCurrentIndex(0);
    setStartedAt(new Date().toISOString());
    setHasStarted(false);
    setLastBreakAt(null);
  };

  const handlePause = () => {
    saveTestDraft({
      variant,
      currentIndex,
      answers,
      startedAt,
      updatedAt: new Date().toISOString(),
    });
    router.push("/");
  };

  const handleRandom = () => {
    if (!hasStarted && draft) {
      clearTestDraft();
      setDraft(null);
      setStartedAt(new Date().toISOString());
    }
    const randomAnswers: Record<string, number> = {};
    questionSet.forEach((question) => {
      randomAnswers[question.id] = Math.random() < 0.5 ? 0 : 1;
    });
    setAnswers(randomAnswers);
    setCurrentIndex(questionSet.length - 1);
    setHasStarted(true);
  };

  const updateSwipeDir = (deltaX: number) => {
    if (deltaX > 12) {
      setSwipeDir("right");
    } else if (deltaX < -12) {
      setSwipeDir("left");
    } else {
      setSwipeDir("none");
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isSwipingOut) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    dragStartTime.current = performance.now();
    lastMoveX.current = event.clientX;
    lastMoveTime.current = dragStartTime.current;
    setIsDragging(true);
    setDragX(0);
    setDragY(0);
    setSwipeDir("none");
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;
    const isMostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 0.8;
    if (!isMostlyHorizontal) {
      setDragX(0);
      setDragY(0);
      updateSwipeDir(0);
      return;
    }
    setDragX(deltaX);
    setDragY(deltaY);
    updateSwipeDir(deltaX);
    lastMoveX.current = event.clientX;
    lastMoveTime.current = performance.now();
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const width = cardRef.current?.offsetWidth ?? 320;
    const threshold = Math.min(120, width * 0.25);
    const deltaX = dragX;
    const elapsed = Math.max(1, performance.now() - dragStartTime.current);
    const velocityX = deltaX / elapsed;
    const shouldCommit =
      Math.abs(deltaX) > threshold || Math.abs(velocityX) > 0.65;

    if (shouldCommit) {
      const dir = deltaX >= 0 ? "right" : "left";
      setSwipeDir(dir);
      setIsSwipingOut(true);
      setDragX((dir === "right" ? 1 : -1) * (width * 1.1));
      setDragY(0);
      window.setTimeout(() => {
        setIsSwipingOut(false);
        setDragX(0);
        setDragY(0);
        setSwipeDir("none");
        commitAnswer(dir === "right" ? 1 : 0, { autoAdvance: true });
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(10);
        }
      }, 160);
    } else {
      setDragX(0);
      setDragY(0);
      setSwipeDir("none");
    }
  };

  const cardRotation = Math.max(-8, Math.min(8, dragX / 20));
  const cardTransform = `translateX(${dragX + enterOffset}px) rotate(${cardRotation}deg)`;
  const cardTransition =
    isDragging || isEntering ? "none" : "transform 180ms ease";

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Torna alla home
        </Link>

        {draft && !hasStarted && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Riprendi sessione
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Abbiamo trovato un test in sospeso. Puoi riprendere dal punto in
              cui eri rimasto.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Versione: {quizVariants[draft.variant].label}</span>
              <span>
                Risposte: {Object.keys(draft.answers).length}/{questionSet.length}
              </span>
              <span>
                Ultimo salvataggio:{" "}
                {draft.updatedAt
                  ? new Date(draft.updatedAt).toLocaleString("it-IT")
                  : "non disponibile"}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleResume}>Riprendi</Button>
              <Button variant="outline" onClick={handleRestart}>
                Ricomincia da capo
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Domanda {currentIndex + 1} di {questionSet.length}
              </span>
              <span>{progress}% completato</span>
            </div>
            <Progress value={progress} />
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Versione: {quizVariants[variant].label}</span>
              <span>Tempo stimato: ~{estimatedMinutes} min</span>
              <span>
                Risposte: {answeredCount}/{questionSet.length}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
              <span
                className={`rounded-full border px-3 py-1 transition ${
                  swipeDir === "left"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                No
              </span>
              <span
                className={`rounded-full border px-3 py-1 transition ${
                  swipeDir === "right"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                Sì
              </span>
            </div>
            <div
              ref={cardRef}
              className={`swipe-card relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${
                isDragging || isSwipingOut ? "swipe-active" : ""
              }`}
              style={{ transform: cardTransform, transition: cardTransition }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <h1 className="text-xl font-semibold text-slate-900">
                {currentQuestion.text}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Swipe a destra per Sì, a sinistra per No. Puoi usare anche i
                tasti S/N.
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Suggerimento: puoi trascinare la card oppure usare i pulsanti
              sotto.
            </p>
          </div>

          {showSaved && (
            <p className="mt-3 text-xs text-emerald-600">
              Risposta salvata.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                className={
                  swipeDir === "left"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : ""
                }
                onClick={() => commitAnswer(0, { autoAdvance: true })}
              >
                No
              </Button>
              <Button
                className={
                  swipeDir === "right"
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : ""
                }
                onClick={() => commitAnswer(1, { autoAdvance: true })}
              >
                Sì
              </Button>
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                Indietro
              </Button>
              <Button variant="ghost" onClick={handlePause}>
                Pausa
              </Button>
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={handleRandom}
              >
                Compila random
              </Button>
            </div>
          </div>

          {missingCount > 0 && (
            <p className="mt-4 text-xs text-slate-500">
              Risposte mancanti: {missingCount}. Torna indietro per completare.
            </p>
          )}
        </Card>

        {showBreak && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Pausa consigliata
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Hai completato {answeredCount} risposte. Una breve pausa aiuta a
              mantenere la concentrazione.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => setLastBreakAt(answeredCount)}>
                Continua
              </Button>
            </div>
          </Card>
        )}

        {summaryPreview && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Anteprima punteggi
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
              {summaryPreview.orderedColors.map((color) => (
                <div key={color} className="rounded-lg bg-slate-100 p-3">
                  <div className="font-medium capitalize">{color}</div>
                  <div>{summaryPreview.percentages[color]}%</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {summaryPreview && (
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Preview quadranti
            </h2>
            <div className="mt-4 flex justify-center">
              <QuadrantChart percentages={summaryPreview.percentages} />
            </div>
          </Card>
        )}

        <div className="text-xs text-slate-500">
          <Link href="/privacy" className="underline hover:text-slate-700">
            Informativa privacy
          </Link>{" "}
          ·{" "}
          <Link href="/diritti" className="underline hover:text-slate-700">
            Diritti GDPR
          </Link>
        </div>
      </main>
    </div>
  );
}
