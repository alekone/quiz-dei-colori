"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, StepBack } from "lucide-react";
import {
  getQuestionsForVariant,
  quizVariants,
  scoreAnswers,
  type Question,
  type QuizVariant,
} from "@/lib/quiz";
import {
  clearTestDraft,
  clearReferrerId,
  getUserCohort,
  getTestDraft,
  getTestDraftForEmail,
  getReferrerId,
  getUserEmail,
  saveTestDraft,
  saveTestResult,
  saveTestResultRemote,
  type TestDraft,
  type TestResult,
} from "@/lib/storage";
import { getCohortInfo } from "@/lib/cohorts";
import { QuadrantChart } from "@/components/quadrant-chart";

export default function TestClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");
  const variant: QuizVariant = variantParam === "short" ? "short" : "full";
  const [questionSet, setQuestionSet] = useState<Question[]>([]);
  const [loadedVariant, setLoadedVariant] = useState<QuizVariant | null>(null);
  const isLoadingQuestions = loadedVariant !== variant;
  const computeInitialDraft = () => {
    const email = getUserEmail();
    const rawDraft = getTestDraft();
    if (email && rawDraft && rawDraft.email !== email) {
      clearTestDraft();
    }
    const existing = email ? getTestDraftForEmail(email) : null;
    if (
      existing &&
      existing.variant === variant &&
      Object.keys(existing.answers).length > 0
    ) {
      return existing;
    }
    return null;
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [draft, setDraft] = useState<TestDraft | null>(() => computeInitialDraft());
  const [hasStarted, setHasStarted] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [lastBreakAt, setLastBreakAt] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | "none">("none");
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [enterOffset, setEnterOffset] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [flashDir, setFlashDir] = useState<"left" | "right" | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveTime = useRef(0);
  const savedTimerRef = useRef<number | null>(null);
  const currentQuestion = questionSet[currentIndex];
  const currentQuestionId = currentQuestion?.id;
  const selectedWeight = currentQuestionId ? answers[currentQuestionId] : undefined;

  useEffect(() => {
    let isMounted = true;
    void getQuestionsForVariant(variant)
      .then((data) => {
        if (!isMounted) return;
        setQuestionSet(data);
        setLoadedVariant(variant);
      });
    return () => {
      isMounted = false;
    };
  }, [variant]);

  useEffect(() => {
    const email = getUserEmail();
    if (!email) {
      router.replace("/login");
    }
  }, [router]);


  const answeredCount = Object.keys(answers).length;
  const progress = questionSet.length
    ? Math.round((answeredCount / questionSet.length) * 100)
    : 0;

  const isLast = currentIndex === questionSet.length - 1;
  const canSubmit = answeredCount === questionSet.length;
  const showBreak =
    questionSet.length > 0 &&
    answeredCount > 0 &&
    answeredCount % 20 === 0 &&
    answeredCount !== lastBreakAt &&
    !isLast;

  const startEnter = useCallback((direction: "left" | "right") => {
    setIsEntering(true);
    setEnterOffset(direction === "left" ? 60 : -60);
    window.requestAnimationFrame(() => {
      setIsEntering(false);
      setEnterOffset(0);
    });
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) return;
    startEnter("right");
    setCurrentIndex((prev) => Math.min(prev + 1, questionSet.length - 1));
  }, [isLast, questionSet.length, startEnter]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const finishWithAnswers = useCallback((nextAnswers: Record<string, number>) => {
    const email = getUserEmail() ?? "utente@demo.test";
    const summary = scoreAnswers(nextAnswers, questionSet);
    const durationMs = Math.max(
      0,
      Date.now() - new Date(startedAt).getTime(),
    );
    const referrerId = getReferrerId() ?? undefined;
    const cohortInfo = getCohortInfo();
    const unlockAt =
      cohortInfo?.unlockDelayMinutes && cohortInfo.unlockDelayMinutes > 0
        ? new Date(
            Date.now() + cohortInfo.unlockDelayMinutes * 60 * 1000,
          ).toISOString()
        : undefined;
    const result: TestResult = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
      email,
      createdAt: new Date().toISOString(),
      startedAt,
      durationMs,
      variant,
      cohort: cohortInfo?.cohortName ?? getUserCohort() ?? undefined,
      cohortId: cohortInfo?.cohortId ?? undefined,
      inviteCode: cohortInfo?.inviteCode ?? undefined,
      unlockAt,
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
  }, [questionSet, router, startedAt, variant]);

  const commitAnswer = useCallback((
    weight: number,
    options: { autoAdvance?: boolean } = {},
  ) => {
    if (!currentQuestionId) return;
    if (!hasStarted && draft) {
      clearTestDraft();
      setDraft(null);
      setStartedAt(new Date().toISOString());
    }
    const nextAnswers = {
      ...answers,
      [currentQuestionId]: weight,
    };
    setAnswers(nextAnswers);
    setHasStarted(true);
    setShowHint(false);
    if (savedTimerRef.current) {
      window.clearTimeout(savedTimerRef.current);
    }
    setShowSaved(true);
    savedTimerRef.current = window.setTimeout(() => setShowSaved(false), 1500);

    if (options.autoAdvance) {
      startEnter(weight === 1 ? "right" : "left");
      if (isLast) {
        if (Object.keys(nextAnswers).length === questionSet.length) {
          finishWithAnswers(nextAnswers);
        }
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, questionSet.length - 1));
      }
    }
  }, [
    answers,
    currentQuestionId,
    draft,
    finishWithAnswers,
    hasStarted,
    isLast,
    questionSet.length,
    startEnter,
  ]);

  const triggerSwipe = useCallback((dir: "left" | "right") => {
    if (isSwipingOut) return;
    const width = cardRef.current?.offsetWidth ?? 320;
    setSwipeDir(dir);
    setFlashDir(dir);
    setIsSwipingOut(true);
    setDragX((dir === "right" ? 1 : -1) * (width * 1.1));
    window.setTimeout(() => {
      setIsSwipingOut(false);
      setDragX(0);
      setSwipeDir("none");
      setFlashDir(null);
      commitAnswer(dir === "right" ? 1 : 0, { autoAdvance: true });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
    }, 450);
  }, [commitAnswer, isSwipingOut]);

  const summaryPreview = useMemo(() => {
    if (!answeredCount || questionSet.length === 0) return null;
    return scoreAnswers(answers, questionSet);
  }, [answeredCount, answers, questionSet]);

  const handleFinish = useCallback(() => {
    if (!canSubmit) return;
    finishWithAnswers(answers);
  }, [answers, canSubmit, finishWithAnswers]);

  useEffect(() => {
    if (!hasStarted || questionSet.length === 0) return;
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
  }, [answers, currentIndex, hasStarted, questionSet.length, startedAt, variant]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (["1", "2", "y", "n", "s"].includes(key)) {
        event.preventDefault();
        const dir = key === "1" || key === "y" || key === "s" ? "right" : "left";
        triggerSwipe(dir);
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
    currentQuestionId,
    handleFinish,
    handleNext,
    isLast,
    selectedWeight,
    triggerSwipe,
  ]);

  const handleResume = () => {
    if (!draft) return;
    setAnswers(draft.answers);
    setCurrentIndex(Math.min(draft.currentIndex, questionSet.length - 1));
    setStartedAt(draft.startedAt);
    setHasStarted(true);
    setShowSaved(false);
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

  const handleRandom = () => {
    if (questionSet.length === 0) return;
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
    setSwipeDir("none");
    setShowHint(false);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;
    const isMostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 0.8;
    if (!isMostlyHorizontal) {
      setDragX(0);
      updateSwipeDir(0);
      return;
    }
    setDragX(deltaX);
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
      triggerSwipe(dir);
    } else {
      setDragX(0);
      setSwipeDir("none");
    }
  };

  const cardRotation = Math.max(-8, Math.min(8, dragX / 20));
  const cardTransform = `translateX(${dragX + enterOffset}px) rotate(${cardRotation}deg)`;
  const cardTransition =
    isDragging || isEntering ? "none" : "transform 180ms ease";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.classList.remove("flash-yes", "flash-no");
    if (flashDir === "right") {
      body.classList.add("flash-yes");
    } else if (flashDir === "left") {
      body.classList.add("flash-no");
    }
    return () => {
      body.classList.remove("flash-yes", "flash-no");
    };
  }, [flashDir]);

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen px-5 py-10">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Caricamento domande...
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Stiamo preparando il test.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen px-5 py-10">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Nessuna domanda disponibile
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Contatta l&apos;amministratore o riprova più tardi.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-600"
        >
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

        <div className="fixed left-0 right-0 top-0 z-20 h-[5px] bg-slate-200">
          <div
            className="h-full bg-slate-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

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
          className={`swipe-card relative rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-md ${
            isDragging || isSwipingOut ? "swipe-active" : ""
          }`}
          style={{ transform: cardTransform, transition: cardTransition }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {showHint && currentIndex === 0 && (
            <>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-200">
                ←
              </span>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-200">
                →
              </span>
            </>
          )}
          <h1 className="text-xl font-semibold text-slate-900">
            {currentQuestion.text}
          </h1>
        </div>

          {showSaved && (
            <p className="mt-3 text-xs text-emerald-600">
              Risposta salvata.
            </p>
          )}

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                className={
                  swipeDir === "left"
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : ""
                }
                onClick={() => triggerSwipe("left")}
              >
                <span>No</span>
                <span className="ml-2 text-xs text-slate-400">(N)</span>
              </Button>
              <Button
                className={
                  swipeDir === "right"
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : ""
                }
                onClick={() => triggerSwipe("right")}
              >
                <span>Sì</span>
                <span className="ml-2 text-xs text-slate-200">(S)</span>
              </Button>
            </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Indietro"
              className="h-8 px-3 text-xs text-slate-500"
            >
              <StepBack className="mr-1 h-3.5 w-3.5" />
              Indietro
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRandom}
              aria-label="Compila random"
              className="h-8 px-3 text-xs text-slate-500"
            >
              <Shuffle className="mr-1 h-3.5 w-3.5" />
              Random
            </Button>
            </div>
          </div>

        {showBreak && (
          <div className="text-xs text-slate-400">
            Hai completato {answeredCount} risposte.
          </div>
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
          <Card className="p-5 pb-10">
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
