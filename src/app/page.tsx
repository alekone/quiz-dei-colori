import Link from "next/link";
import { Suspense } from "react";
import ReferralCapture from "@/components/referral-capture";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-12 sm:px-8">
        <Suspense fallback={null}>
          <OnboardingFlow />
        </Suspense>
      </main>
      <footer className="mx-auto flex w-full max-w-3xl flex-wrap gap-3 px-5 pb-10 text-xs text-slate-400 sm:px-8">
        <Link href="/admin/login" className="underline hover:text-slate-600">
          Admin
        </Link>
        <Link href="/dashboard" className="underline hover:text-slate-600">
          Dashboard
        </Link>
        <Link href="/privacy" className="underline hover:text-slate-600">
          Informativa privacy
        </Link>
        <Link href="/diritti" className="underline hover:text-slate-600">
          Diritti GDPR
        </Link>
      </footer>
    </div>
  );
}
