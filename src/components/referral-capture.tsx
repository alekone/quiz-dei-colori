"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setReferrerId } from "@/lib/storage";

export default function ReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      setReferrerId(ref);
    }
  }, [ref]);

  return null;
}
