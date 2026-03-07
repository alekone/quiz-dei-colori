"use client";

import { useEffect, useRef, useState } from "react";
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
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragStartTime = useRef(0);

  const [teaserQuestion, setTeaserQuestion] = useState(() => {
    const questions = getQuestionsForVariant(variant);
    return questions[0];
  });
  const [isMounted, setIsMounted] = useState(false);

  const handleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleSwipeConfirm = () => {
    if (stepIndex >= totalSteps - 1) return;
    handleNext();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const questions = getQuestionsForVariant(variant);
    const randomIndex = Math.floor(Math.random() * questions.length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeaserQuestion(questions[randomIndex]);
  }, [isMounted, variant]);

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
    if (stepIndex >= totalSteps - 1 || isSwipingOut) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button")) return;
    setIsDragging(true);
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    dragStartTime.current = performance.now();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
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
  };

  const triggerSwipe = (dir: "left" | "right") => {
    if (isSwipingOut || stepIndex >= totalSteps - 1) return;
    setSwipeDir(dir);
    setFlashDir(dir);
    setIsSwipingOut(true);
    setDragX((dir === "right" ? 1 : -1) * 360);
    window.setTimeout(() => {
      setIsSwipingOut(false);
      setDragX(0);
      setSwipeDir("none");
      setFlashDir(null);
      handleSwipeConfirm();
    }, 260);
  };

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

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;
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
  };

  const startTest = () => {
    router.push(`/test?variant=${variant}`);
  };

  const cardTransform = `translateX(${dragX}px) rotate(${Math.max(
    -6,
    Math.min(6, dragX / 20),
  )}deg)`;
  const cardTransition = isDragging || isSwipingOut ? "none" : "transform 260ms ease";

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-400 ${
        flashDir === "right"
          ? "bg-emerald-50"
          : flashDir === "left"
            ? "bg-rose-50"
            : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 py-6">
        {stepIndex === 0 && (
        <Card
          className="relative p-6"
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
            {isMounted ? teaserQuestion.text : "Caricamento..."}
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

        {stepIndex === 1 && (
        <Card
          className="relative p-6"
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
            Che colore sei? Rosso o verde?
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            È un test di personalità che aiuta a capire come vivere meglio con
            gli altri. Richiede circa 10 minuti.
          </p>
          <p className="mt-3 text-sm text-slate-600">Ti va di scoprirlo?</p>
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

        {stepIndex === 2 && (
        <Card
          className="relative p-6"
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
            Usa swipe o scorciatoie.
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Swipe a destra per dire Sì, swipe a sinistra per dire No. Da desktop
            puoi usare le scorciatoie S/N.
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

        {stepIndex === 3 && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            Inserisci la tua email per iniziare.
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Il gruppo viene compilato automaticamente se arrivi da un invito.
          </p>
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
