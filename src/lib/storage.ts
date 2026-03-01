import type { Color, QuizVariant, ScoreSummary } from "./quiz";
import { isSupabaseEnabled, supabaseClient } from "./supabaseClient";

export type TestResult = {
  id: string;
  email: string;
  createdAt: string;
  startedAt?: string;
  durationMs?: number;
  variant?: QuizVariant;
  cohort?: string;
  cohortId?: string;
  inviteCode?: string;
  unlockAt?: string;
  unlockedAt?: string;
  referrerId?: string;
  answers: Record<string, number>;
  summary: ScoreSummary;
  questionCount: number;
};

type TestResultRow = {
  id: string;
  email: string;
  created_at: string;
  started_at: string | null;
  duration_ms: number | null;
  variant: string | null;
  cohort: string | null;
  cohort_id: string | null;
  referrer_id: string | null;
  invite_code: string | null;
  unlock_at: string | null;
  unlocked_at: string | null;
  answers: Record<string, number>;
  summary: ScoreSummary;
  question_count: number;
};

const USER_EMAIL_KEY = "qc_user_email";
const USER_COHORT_KEY = "qc_user_cohort";
const REFERRER_KEY = "qc_referrer_id";
const RESULTS_KEY = "qc_test_results";
const DRAFT_KEY = "qc_test_draft";

const isBrowser = () => typeof window !== "undefined";
const colors: Color[] = ["rosso", "giallo", "verde", "blu"];

export const normalizeSummary = (summary: Partial<ScoreSummary>): ScoreSummary => {
  const scores = summary.scores ?? {
    rosso: 0,
    giallo: 0,
    verde: 0,
    blu: 0,
  };
  const percentages = summary.percentages ?? {
    rosso: 0,
    giallo: 0,
    verde: 0,
    blu: 0,
  };
  const orderedColors =
    summary.orderedColors ??
    (colors.slice().sort((a, b) => percentages[b] - percentages[a]) as Color[]);
  const topPercent = percentages[orderedColors[0]] ?? 0;
  const balanced = orderedColors.every(
    (color) => percentages[color] === topPercent,
  );
  const coDominantColors = balanced
    ? colors
    : orderedColors.filter(
        (color) => Math.abs(percentages[color] - topPercent) <= 5,
      );
  const topColor = balanced ? null : orderedColors[0];
  const secondaryColor =
    balanced || coDominantColors.length > 1 ? null : orderedColors[1] ?? null;
  const zeroColors = colors.filter((color) => scores[color] === 0);
  const total =
    summary.total ??
    Object.values(scores).reduce((sum, value) => sum + value, 0);

  return {
    scores,
    sectionTotals: summary.sectionTotals ?? {
      rosso: 0,
      giallo: 0,
      verde: 0,
      blu: 0,
    },
    percentages,
    total,
    topColor,
    secondaryColor,
    orderedColors,
    coDominantColors,
    balanced,
    zeroColors,
  };
};

export const getUserEmail = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(USER_EMAIL_KEY);
};

export const setUserEmail = (email: string) => {
  if (!isBrowser()) return;
  const normalized = email.trim().toLowerCase();
  window.localStorage.setItem(USER_EMAIL_KEY, normalized);
  const draft = getTestDraft();
  if (draft && draft.email !== normalized) {
    clearTestDraft();
  }
};

export const clearUserEmail = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(USER_EMAIL_KEY);
};

export const getUserCohort = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(USER_COHORT_KEY);
};

export const setUserCohort = (cohort: string) => {
  if (!isBrowser()) return;
  const trimmed = cohort.trim();
  if (!trimmed) {
    window.localStorage.removeItem(USER_COHORT_KEY);
    return;
  }
  window.localStorage.setItem(USER_COHORT_KEY, trimmed);
};

export const clearUserCohort = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(USER_COHORT_KEY);
};

export const getReferrerId = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFERRER_KEY);
};

export const setReferrerId = (referrerId: string) => {
  if (!isBrowser()) return;
  const trimmed = referrerId.trim();
  if (!trimmed) return;
  window.localStorage.setItem(REFERRER_KEY, trimmed);
};

export const clearReferrerId = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(REFERRER_KEY);
};

export type TestDraft = {
  email: string;
  variant: QuizVariant;
  currentIndex: number;
  answers: Record<string, number>;
  startedAt: string;
  updatedAt: string;
};

export const getTestResults = (): TestResult[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(RESULTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as TestResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((result) => ({
      ...result,
      summary: normalizeSummary(result.summary),
    }));
  } catch {
    return [];
  }
};

export const getTestResultsByEmail = (email: string): TestResult[] => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return [];
  return getTestResults().filter((result) => result.email === normalized);
};

export const saveTestResult = (result: TestResult) => {
  if (!isBrowser()) return;
  const existing = getTestResults();
  const updated = [result, ...existing];
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
};

export const deleteTestResultsByEmail = (email: string): number => {
  if (!isBrowser()) return 0;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 0;
  const existing = getTestResults();
  const filtered = existing.filter((result) => result.email !== normalized);
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(filtered));
  return existing.length - filtered.length;
};

export const saveTestResultRemote = async (result: TestResult) => {
  if (!isSupabaseEnabled || !supabaseClient) return;
  const payload: TestResultRow = {
    id: result.id,
    email: result.email,
    created_at: result.createdAt,
    started_at: result.startedAt ?? null,
    duration_ms: result.durationMs ?? null,
    variant: result.variant ?? null,
    cohort: result.cohort ?? null,
    cohort_id: result.cohortId ?? null,
    referrer_id: result.referrerId ?? null,
    invite_code: result.inviteCode ?? null,
    unlock_at: result.unlockAt ?? null,
    unlocked_at: result.unlockedAt ?? null,
    answers: result.answers,
    summary: result.summary,
    question_count: result.questionCount,
  };

  const { error } = await supabaseClient.from("test_results").insert(payload);
  if (error) {
    console.error("Supabase insert error", error.message);
  }
};

export const getTestResultsRemote = async (): Promise<{
  results: TestResult[];
  error?: string;
}> => {
  if (!isSupabaseEnabled || !supabaseClient) {
    return { results: [], error: "Supabase non configurato" };
  }

  const { data, error } = await supabaseClient
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase fetch error", error?.message);
    return { results: [], error: error?.message ?? "Errore sconosciuto" };
  }

  const results = data
    .map((row) => {
      const answers =
        typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers;
      const summary =
        typeof row.summary === "string" ? JSON.parse(row.summary) : row.summary;

      return {
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
        startedAt: row.started_at ?? undefined,
        durationMs: row.duration_ms ?? undefined,
        variant:
          row.variant === "short" ? "short" : row.variant ? "full" : undefined,
        cohort: row.cohort ?? undefined,
        cohortId: row.cohort_id ?? undefined,
        referrerId: row.referrer_id ?? undefined,
        inviteCode: row.invite_code ?? undefined,
        unlockAt: row.unlock_at ?? undefined,
        unlockedAt: row.unlocked_at ?? undefined,
        answers,
        summary: normalizeSummary(summary),
        questionCount: row.question_count,
      } as TestResult;
    })
    .filter((row) => row?.summary);

  return { results };
};

export const getTestResultsRemoteByEmail = async (
  email: string,
): Promise<{
  results: TestResult[];
  error?: string;
}> => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { results: [], error: "Email non valida" };
  }
  if (!isSupabaseEnabled || !supabaseClient) {
    return { results: [], error: "Supabase non configurato" };
  }

  const { data, error } = await supabaseClient
    .from("test_results")
    .select("*")
    .eq("email", normalized)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Supabase fetch error", error?.message);
    return { results: [], error: error?.message ?? "Errore sconosciuto" };
  }

  const results = data.map((row) => ({
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    durationMs: row.duration_ms ?? undefined,
    variant: row.variant === "short" ? "short" : row.variant ? "full" : undefined,
    cohort: row.cohort ?? undefined,
    cohortId: row.cohort_id ?? undefined,
    referrerId: row.referrer_id ?? undefined,
    inviteCode: row.invite_code ?? undefined,
    unlockAt: row.unlock_at ?? undefined,
    unlockedAt: row.unlocked_at ?? undefined,
    answers: row.answers,
    summary: normalizeSummary(
      typeof row.summary === "string" ? JSON.parse(row.summary) : row.summary,
    ),
    questionCount: row.question_count,
  })) as TestResult[];

  return { results };
};

export const deleteTestResultsRemoteByEmail = async (
  email: string,
): Promise<{ deleted: number; error?: string }> => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { deleted: 0, error: "Email non valida" };
  }
  if (!isSupabaseEnabled || !supabaseClient) {
    return { deleted: 0, error: "Supabase non configurato" };
  }

  const { data, error } = await supabaseClient
    .from("test_results")
    .delete()
    .eq("email", normalized)
    .select("id");

  if (error) {
    console.error("Supabase delete error", error.message);
    return { deleted: 0, error: error.message };
  }

  return { deleted: data?.length ?? 0 };
};

export const checkRemoteDeletePermission = async (): Promise<{
  allowed: boolean;
  error?: string;
}> => {
  if (!isSupabaseEnabled || !supabaseClient) {
    return { allowed: false, error: "Supabase non configurato" };
  }

  const { error } = await supabaseClient
    .from("test_results")
    .delete()
    .eq("email", "__permission_check__@invalid.local")
    .select("id");

  if (error) {
    return { allowed: false, error: error.message };
  }

  return { allowed: true };
};

export const getTestResultById = (id: string): TestResult | null => {
  const results = getTestResults();
  return results.find((result) => result.id === id) ?? null;
};

export const getTestDraft = (): TestDraft | null => {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as TestDraft;
    if (!parsed?.variant || !parsed?.answers || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const getTestDraftForEmail = (email: string): TestDraft | null => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const draft = getTestDraft();
  if (!draft || draft.email !== normalized) return null;
  return draft;
};

export const saveTestDraft = (draft: TestDraft) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

export const clearTestDraft = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(DRAFT_KEY);
};
