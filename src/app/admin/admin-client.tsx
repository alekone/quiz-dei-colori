"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { callAdminFunction } from "@/lib/adminApi";
import { clearAdminSession, getAdminSession } from "@/lib/adminSession";

type AdminTestRow = {
  id: string;
  email: string;
  created_at: string;
  duration_ms: number | null;
  variant: string | null;
  cohort: string | null;
  cohort_id: string | null;
  invite_code: string | null;
  unlock_at: string | null;
  question_count: number;
};

type CohortRow = {
  id: string;
  name: string;
  unlock_delay_minutes: number;
  created_at: string;
};

type InviteRow = {
  id: string;
  code: string;
  created_at: string;
  revoked_at: string | null;
  cohort_id: string;
  cohorts?: { name?: string };
};

type AdminUserRow = {
  id: string;
  username: string;
  is_active: boolean;
  created_at: string;
};

type ParticipantRow = { email: string; tests: number };

export default function AdminClient() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getAdminSession>>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tests, setTests] = useState<AdminTestRow[]>([]);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);

  const [cohortName, setCohortName] = useState("");
  const [cohortDelay, setCohortDelay] = useState("0");
  const [inviteCohort, setInviteCohort] = useState("");

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [editCohorts, setEditCohorts] = useState<Record<string, string>>({});
  const [editDelays, setEditDelays] = useState<Record<string, string>>({});
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});

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

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        testsRes,
        cohortsRes,
        invitesRes,
        adminsRes,
        participantsRes,
      ] = await Promise.all([
        callAdminFunction<{ results: AdminTestRow[] }>("admin-list-tests"),
        callAdminFunction<{ cohorts: CohortRow[] }>("admin-list-cohorts"),
        callAdminFunction<{ invites: InviteRow[] }>("admin-list-invites"),
        callAdminFunction<{ admins: AdminUserRow[] }>("admin-list-users"),
        callAdminFunction<{ participants: ParticipantRow[] }>(
          "admin-list-participants",
        ),
      ]);
      setTests(testsRes.results);
      setCohorts(cohortsRes.cohorts);
      setInvites(invitesRes.invites);
      setAdmins(adminsRes.admins);
      setParticipants(participantsRes.participants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore caricamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      void loadAll();
    }
  }, [session]);

  const cohortOptions = useMemo(
    () => cohorts.map((cohort) => ({ id: cohort.id, name: cohort.name })),
    [cohorts],
  );

  const handleLogout = async () => {
    try {
      await callAdminFunction("admin-logout");
    } catch {
      // ignore
    }
    clearAdminSession();
    router.replace("/admin/login");
  };

  const handleCreateCohort = async () => {
    if (!cohortName.trim()) return;
    await callAdminFunction("admin-create-cohort", {
      name: cohortName,
      unlockDelayMinutes: Number(cohortDelay) || 0,
    });
    setCohortName("");
    setCohortDelay("0");
    await loadAll();
  };

  const handleUpdateCohort = async (cohort: CohortRow) => {
    const name = editCohorts[cohort.id] ?? cohort.name;
    const delay = editDelays[cohort.id] ?? String(cohort.unlock_delay_minutes);
    await callAdminFunction("admin-update-cohort", {
      id: cohort.id,
      name,
      unlockDelayMinutes: Number(delay) || 0,
    });
    await loadAll();
  };

  const handleDeleteCohort = async (cohortId: string) => {
    await callAdminFunction("admin-delete-cohort", { id: cohortId });
    await loadAll();
  };

  const handleCreateInvite = async () => {
    if (!inviteCohort) return;
    await callAdminFunction("admin-create-invite", { cohortId: inviteCohort });
    await loadAll();
  };

  const handleRevokeInvite = async (inviteId: string) => {
    await callAdminFunction("admin-revoke-invite", { id: inviteId });
    await loadAll();
  };

  const handleDeleteTest = async (id: string) => {
    await callAdminFunction("admin-delete-test", { id });
    await loadAll();
  };

  const handleDeleteByEmail = async (email: string) => {
    await callAdminFunction("admin-delete-by-email", { email });
    await loadAll();
  };

  const handleCreateAdmin = async () => {
    if (!adminUsername.trim() || !adminPassword.trim()) return;
    await callAdminFunction("admin-create-user", {
      username: adminUsername,
      password: adminPassword,
    });
    setAdminUsername("");
    setAdminPassword("");
    await loadAll();
  };

  const handleUpdateAdmin = async (admin: AdminUserRow) => {
    const password = resetPasswords[admin.id];
    await callAdminFunction("admin-update-user", {
      id: admin.id,
      isActive: admin.is_active,
      password: password && password.trim() ? password : undefined,
    });
    setResetPasswords((prev) => ({ ...prev, [admin.id]: "" }));
    await loadAll();
  };

  if (!isMounted || !session) {
    return null;
  }

  return (
    <div className="min-h-screen px-5 py-10">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
              ← Torna alla home
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">
              Dashboard admin
            </h1>
            <p className="text-sm text-slate-600">
              Ciao {session.adminUser.username}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadAll} disabled={loading}>
              Aggiorna dati
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

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">Coorti</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_150px_auto]">
              <Input
                placeholder="Nome coorte"
                value={cohortName}
                onChange={(event) => setCohortName(event.target.value)}
              />
              <Input
                placeholder="Delay (min)"
                value={cohortDelay}
                onChange={(event) => setCohortDelay(event.target.value)}
              />
              <Button onClick={handleCreateCohort}>Crea</Button>
            </div>
            <div className="mt-4 space-y-3">
              {cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{cohort.name}</Badge>
                      <span className="text-xs text-slate-500">
                        {cohort.unlock_delay_minutes} min
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateCohort(cohort)}
                      >
                        Salva
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCohort(cohort.id)}
                      >
                        Elimina
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_120px]">
                    <Input
                      value={editCohorts[cohort.id] ?? cohort.name}
                      onChange={(event) =>
                        setEditCohorts((prev) => ({
                          ...prev,
                          [cohort.id]: event.target.value,
                        }))
                      }
                    />
                    <Input
                      value={
                        editDelays[cohort.id] ??
                        String(cohort.unlock_delay_minutes)
                      }
                      onChange={(event) =>
                        setEditDelays((prev) => ({
                          ...prev,
                          [cohort.id]: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
              {cohorts.length === 0 && (
                <p className="text-xs text-slate-500">
                  Nessuna coorte creata.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">Inviti</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <select
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                value={inviteCohort}
                onChange={(event) => setInviteCohort(event.target.value)}
              >
                <option value="">Seleziona coorte</option>
                {cohortOptions.map((cohort) => (
                  <option key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleCreateInvite}>Genera invito</Button>
            </div>
            <div className="mt-4 space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {invite.code}
                    </div>
                    <div className="text-xs text-slate-500">
                      {invite.cohorts?.name ?? "Coorte"} ·{" "}
                      {new Date(invite.created_at).toLocaleString("it-IT")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invite.revoked_at ? (
                      <Badge variant="outline">Revocato</Badge>
                    ) : (
                      <Badge variant="secondary">Attivo</Badge>
                    )}
                    {!invite.revoked_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRevokeInvite(invite.id)}
                      >
                        Revoca
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {invites.length === 0 && (
                <p className="text-xs text-slate-500">Nessun invito creato.</p>
              )}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">Test recenti</h2>
            <div className="mt-4 space-y-3">
              {tests.map((test) => {
                const duration = test.duration_ms
                  ? Math.max(1, Math.round(test.duration_ms / 60000))
                  : null;
                return (
                  <div
                    key={test.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {test.email}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(test.created_at).toLocaleString("it-IT")}
                          {test.cohort ? ` · ${test.cohort}` : ""}
                          {duration ? ` · ${duration} min` : ""}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          Elimina
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteByEmail(test.email)}
                        >
                          Elimina per email
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tests.length === 0 && (
                <p className="text-xs text-slate-500">
                  Nessun test disponibile.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-slate-700">
              Partecipanti
            </h2>
            <div className="mt-4 space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.email}
                  className="flex items-center justify-between text-sm text-slate-700"
                >
                  <span>{participant.email}</span>
                  <span className="text-xs text-slate-500">
                    {participant.tests} test
                  </span>
                </div>
              ))}
              {participants.length === 0 && (
                <p className="text-xs text-slate-500">
                  Nessun partecipante trovato.
                </p>
              )}
            </div>
          </Card>
        </section>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-700">Admin users</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Nuovo username"
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
            />
            <Button onClick={handleCreateAdmin}>Aggiungi</Button>
          </div>
          <div className="mt-4 space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    {admin.username}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={admin.is_active ? "secondary" : "outline"}>
                      {admin.is_active ? "Attivo" : "Disattivato"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleUpdateAdmin({
                          ...admin,
                          is_active: !admin.is_active,
                        })
                      }
                    >
                      {admin.is_active ? "Disattiva" : "Attiva"}
                    </Button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    placeholder="Nuova password"
                    type="password"
                    value={resetPasswords[admin.id] ?? ""}
                    onChange={(event) =>
                      setResetPasswords((prev) => ({
                        ...prev,
                        [admin.id]: event.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateAdmin(admin)}
                  >
                    Aggiorna
                  </Button>
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-xs text-slate-500">
                Nessun admin disponibile.
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
