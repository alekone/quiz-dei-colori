"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/login-form";
import { getQuestionsForVariant, type QuizVariant } from "@/lib/quiz";

const totalSteps = 4;

export default function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");
  const refParam = searchParams.get("ref");
  const variant: QuizVariant = variantParam === "short" ? "short" : "full";
  const [stepIndex, setStepIndex] = useState(0);
  const [isSwipingOut, setIsSwipingOut] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | "none">("none");
  const [flashDir, setFlashDir] = useState<"left" | "right" | null>(null);
  const [detourStep, setDetourStep] = useState<number | null>(null);
  const [detourTitle, setDetourTitle] = useState(
    "Non dovevi cliccare NO, clicca SI!",
  );
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);

  const seedId = useId();
  const teaserQuestion = useMemo(() => {
    const questions = getQuestionsForVariant(variant);
    let hash = 0;
    for (let i = 0; i < seedId.length; i += 1) {
      hash = (hash * 31 + seedId.charCodeAt(i)) % 100000;
    }
    const index = Math.abs(hash) % questions.length;
    return questions[index];
  }, [seedId, variant]);

  const detourTitles = useMemo(
    () => [
      "Non dovevi cliccare NO, clicca SI!",
      "Posso già dirti che hai un caratteraccio",
      "Dai per favore, il tasto giusto è quell'altro",
      "Non ci siamo capiti, devi scegliere SI",
      "La risposta giusta è un'altra",
      "La risposta giusta è dentro di te (e non è NO)",
      "Hint: usa il tasto verde",
    ],
    [],
  );

  const handleNext = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  }, []);

  const handleSwipeConfirm = useCallback(() => {
    if (stepIndex >= totalSteps - 1) return;
    handleNext();
  }, [handleNext, stepIndex]);

  const enterDetour = useCallback(() => {
    setDetourStep(stepIndex);
    const nextTitle =
      detourTitles[Math.floor(Math.random() * detourTitles.length)];
    setDetourTitle(nextTitle);
  }, [detourTitles, stepIndex]);

  const exitDetour = useCallback(() => {
    setDetourStep(null);
  }, []);

  const updateSwipeDir = useCallback((deltaX: number) => {
    if (deltaX > 12) {
      setSwipeDir("right");
    } else if (deltaX < -12) {
      setSwipeDir("left");
    } else {
      setSwipeDir("none");
    }
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stepIndex >= totalSteps - 1 || isSwipingOut) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button")) return;
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    dragStartTime.current = performance.now();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;
    const isMostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 0.8;
    if (!isMostlyHorizontal) {
      setDragX(0);
      updateSwipeDir(0);
      return;
    }
    setDragX(deltaX);
    updateSwipeDir(deltaX);
  }, [isDragging, updateSwipeDir]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    updateDrag(event.clientX, event.clientY);
  };

  const triggerSwipe = useCallback((dir: "left" | "right") => {
    if (isSwipingOut) return;
    if (detourStep !== null) {
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
        if (dir === "right") {
          exitDetour();
        } else {
          const nextTitle =
            detourTitles[Math.floor(Math.random() * detourTitles.length)];
          setDetourTitle(nextTitle);
        }
      }, 450);
      return;
    }
    if (stepIndex >= totalSteps - 1) return;
    if (dir === "left" && stepIndex > 0) {
      enterDetour();
      return;
    }
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
      handleSwipeConfirm();
    }, 450);
  }, [
    detourStep,
    detourTitles,
    enterDetour,
    exitDetour,
    handleSwipeConfirm,
    isSwipingOut,
    stepIndex,
  ]);

  useEffect(() => {
    if (stepIndex >= totalSteps - 1) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "s" || key === "y" || key === "n") {
        event.preventDefault();
        triggerSwipe(key === "n" ? "left" : "right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stepIndex, triggerSwipe]);

  const finishDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = clientX - dragStartX.current;
    const deltaY = clientY - dragStartY.current;
    const isMostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 0.8;
    if (!isMostlyHorizontal) {
      setDragX(0);
      setSwipeDir("none");
      return;
    }
    const elapsed = Math.max(1, performance.now() - dragStartTime.current);
    const velocityX = deltaX / elapsed;
    const shouldCommit = Math.abs(deltaX) > 90 || Math.abs(velocityX) > 0.6;
    if (shouldCommit) {
      triggerSwipe(deltaX >= 0 ? "right" : "left");
    } else {
      setDragX(0);
      setSwipeDir("none");
    }
  }, [isDragging, triggerSwipe]);

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event.clientX, event.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (event: PointerEvent) => updateDrag(event.clientX, event.clientY);
    const handleUp = (event: PointerEvent) => finishDrag(event.clientX, event.clientY);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging, updateDrag, finishDrag]);

  const startTest = () => {
    router.push(`/test?variant=${variant}`);
  };

  const cardTransform = `translateX(${dragX}px) rotate(${Math.max(
    -6,
    Math.min(6, dragX / 20),
  )}deg)`;
  const cardTransition = isDragging || isSwipingOut ? "none" : "transform 180ms ease";

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

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-6">
        {detourStep !== null && (
        <Card
          ref={cardRef}
          className="relative p-6 swipe-card"
          style={{ transform: cardTransform, transition: cardTransition }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
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
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            {detourTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Sono quasi sicuro che hai scelto NO per sbaglio
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Fai swipe a destra o premi S per tornare al test.
          </p>
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => triggerSwipe("left")}
            >
              No
            </Button>
            <Button className="cursor-pointer" onClick={() => triggerSwipe("right")}>
              Sì
            </Button>
          </div>
        </Card>
        )}
        {detourStep === null && stepIndex === 0 && (
        <Card
          ref={cardRef}
          className="relative p-6 swipe-card"
          style={{ transform: cardTransform, transition: cardTransition }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
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
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            {teaserQuestion.text}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Ti senti d&apos;accordo con questa affermazione?
          </p>
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => triggerSwipe("left")}
            >
              No
            </Button>
            <Button className="cursor-pointer" onClick={() => triggerSwipe("right")}>
              Sì
            </Button>
          </div>
        </Card>
        )}

        {detourStep === null && stepIndex === 1 && (
        <Card
          ref={cardRef}
          className="relative p-6 swipe-card"
          style={{ transform: cardTransform, transition: cardTransition }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
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
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">
            Vuoi provare a fare il test?
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Che colore sei? Rosso, Giallo, Verde o Blu?
          </p>
          <p className="mt-3 text-sm text-slate-600">
            È un test di personalità che aiuta a capire come vivere meglio con
            gli altri. Richiede circa 10 minuti.
          </p>
          <p className="mt-3 text-sm text-slate-600">Partiamo?</p>
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => triggerSwipe("left")}
            >
              No
            </Button>
            <Button className="cursor-pointer" onClick={() => triggerSwipe("right")}>
              Sì
            </Button>
          </div>
        </Card>
        )}

        {detourStep === null && stepIndex === 2 && (
        <Card
          ref={cardRef}
          className="relative p-6 swipe-card"
          style={{ transform: cardTransform, transition: cardTransition }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
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
          <h2 className="text-2xl font-semibold text-slate-900">
            Fai swipe se hai capito come funziona
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Swipe a destra per dire Sì, swipe a sinistra per dire No. Da desktop
            puoi usare anche i tasti S/N.
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Fai swipe a destra o premi S per continuare.
          </p>
          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => triggerSwipe("left")}
            >
              No
            </Button>
            <Button className="cursor-pointer" onClick={() => triggerSwipe("right")}>
              Sì
            </Button>
          </div>
        </Card>
        )}

        {detourStep === null && stepIndex === 3 && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Mi serve la tua mail per mandarti i risultati
          </h2>
          <div className="mt-4">
            <LoginForm
              variant={variant}
              refParam={refParam}
              onContinue={startTest}
              showVariantLabel={false}
              submitLabel="Inizia il test"
            />
          </div>
        </Card>
        )}
      </div>
    </div>
  );
}
