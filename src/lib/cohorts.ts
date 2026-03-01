import { callPublicFunction } from "./adminApi";
import { setUserCohort } from "./storage";

export type CohortInfo = {
  cohortId: string;
  cohortName: string | null;
  inviteCode: string;
  unlockDelayMinutes: number;
};

const COHORT_ID_KEY = "qc_cohort_id";
const COHORT_NAME_KEY = "qc_cohort_name";
const INVITE_CODE_KEY = "qc_invite_code";
const COHORT_DELAY_KEY = "qc_cohort_delay";

const isBrowser = () => typeof window !== "undefined";

export const getCohortInfo = (): CohortInfo | null => {
  if (!isBrowser()) return null;
  const cohortId = window.localStorage.getItem(COHORT_ID_KEY);
  const inviteCode = window.localStorage.getItem(INVITE_CODE_KEY);
  if (!cohortId || !inviteCode) return null;
  const cohortName = window.localStorage.getItem(COHORT_NAME_KEY);
  const delayRaw = window.localStorage.getItem(COHORT_DELAY_KEY);
  const unlockDelayMinutes = delayRaw ? Number(delayRaw) : 0;
  return {
    cohortId,
    cohortName,
    inviteCode,
    unlockDelayMinutes: Number.isFinite(unlockDelayMinutes)
      ? unlockDelayMinutes
      : 0,
  };
};

export const setCohortInfo = (info: CohortInfo) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(COHORT_ID_KEY, info.cohortId);
  window.localStorage.setItem(INVITE_CODE_KEY, info.inviteCode);
  window.localStorage.setItem(COHORT_DELAY_KEY, String(info.unlockDelayMinutes));
  if (info.cohortName) {
    window.localStorage.setItem(COHORT_NAME_KEY, info.cohortName);
    setUserCohort(info.cohortName);
  }
};

export const clearCohortInfo = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(COHORT_ID_KEY);
  window.localStorage.removeItem(COHORT_NAME_KEY);
  window.localStorage.removeItem(INVITE_CODE_KEY);
  window.localStorage.removeItem(COHORT_DELAY_KEY);
};

export const resolveInvite = async (code: string): Promise<CohortInfo> => {
  const payload = await callPublicFunction<CohortInfo>("resolve-invite", {
    code,
  });
  return payload;
};
