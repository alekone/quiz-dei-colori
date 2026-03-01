"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setReferrerId } from "@/lib/storage";
import { resolveInvite, setCohortInfo } from "@/lib/cohorts";

export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!ref) return;
    setReferrerId(ref);
    const run = async () => {
      try {
        const info = await resolveInvite(ref);
        setCohortInfo(info);
      } catch {
        // ref valido per referral, non per coorte
      }
    };
    void run();
  }, [ref]);

  return null;
}
