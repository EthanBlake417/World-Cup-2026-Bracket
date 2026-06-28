"use client";

import { useEffect, useMemo, useState } from "react";
import Bracket from "@/components/Bracket";
import {
  matchesInRound,
  prunePicks,
  resolveTeams,
  type Picks,
  type R32Teams,
  type Results,
  type Settings,
  type Team,
} from "@/lib/bracket";

type Draft = Record<string, { aName: string; aCode: string; bName: string; bCode: string }>;

function emptyDraft(): Draft {
  const d: Draft = {};
  for (let i = 1; i <= 16; i++) {
    d[`M${i}`] = { aName: "", aCode: "", bName: "", bCode: "" };
  }
  return d;
}

function draftFromTeams(teams: R32Teams): Draft {
  const d = emptyDraft();
  for (let i = 1; i <= 16; i++) {
    const slot = teams[`M${i}`];
    if (slot?.a) {
      d[`M${i}`].aName = slot.a.name;
      d[`M${i}`].aCode = slot.a.code;
    }
    if (slot?.b) {
      d[`M${i}`].bName = slot.b.name;
      d[`M${i}`].bCode = slot.b.code;
    }
  }
  return d;
}

function draftToTeams(draft: Draft): R32Teams {
  const t: R32Teams = {};
  for (let i = 1; i <= 16; i++) {
    const dd = draft[`M${i}`];
    const a: Team | null = dd.aName.trim()
      ? { name: dd.aName.trim(), code: dd.aCode.trim().toLowerCase() }
      : null;
    const b: Team | null = dd.bName.trim()
      ? { name: dd.bName.trim(), code: dd.bCode.trim().toLowerCase() }
      : null;
    t[`M${i}`] = { a, b };
  }
  return t;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [results, setResults] = useState<Results>({});
  const [settings, setSettings] = useState<Settings>({ locked: false });
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wc2026-admin-pw");
    if (saved) setPassword(saved);
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return; // db not initialized yet; that's fine
        setDraft(draftFromTeams(d.r32Teams));
        setResults(d.results ?? {});
        setSettings(d.settings ?? { locked: false });
      })
      .catch(() => {});
  }, []);

  const r32Teams = useMemo(() => draftToTeams(draft), [draft]);

  function rememberPw(pw: string) {
    setPassword(pw);
    try {
      localStorage.setItem("wc2026-admin-pw", pw);
    } catch {
      /* ignore */
    }
  }

  async function post(url: string, body: object) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ kind: "err", text: data.error ?? "Failed." });
        return false;
      }
      return true;
    } catch {
      setMsg({ kind: "err", text: "Network error." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function initDb() {
    if (await post("/api/init", { password })) {
      setMsg({ kind: "ok", text: "Database initialized." });
    }
  }
  async function saveTeams() {
    if (await post("/api/admin/teams", { r32Teams })) {
      setMsg({ kind: "ok", text: "Teams saved." });
    }
  }
  async function saveResults() {
    if (await post("/api/admin/results", { results })) {
      setMsg({ kind: "ok", text: "Results saved." });
    }
  }
  async function toggleLock() {
    const next = !settings.locked;
    if (await post("/api/admin/lock", { locked: next })) {
      setSettings({ locked: next });
      setMsg({ kind: "ok", text: next ? "Submissions locked." : "Submissions unlocked." });
    }
  }

  function updateSlot(matchId: string, field: keyof Draft[string], value: string) {
    setDraft((prev) => ({ ...prev, [matchId]: { ...prev[matchId], [field]: value } }));
  }

  function handleResultPick(matchId: string, name: string) {
    setResults((prev) => prunePicks({ ...prev, [matchId]: name } as Picks, r32Teams) as Results);
  }

  const teamsReady = Object.values(r32Teams).some((s) => s.a || s.b);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-slate-500">
          Set the teams, enter results as matches finish, and lock submissions when the
          tournament starts.
        </p>
      </div>

      {/* Password + init */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold">Admin password</label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => rememberPw(e.target.value)}
            placeholder="ADMIN_PASSWORD"
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-pitch"
          />
          <button
            onClick={initDb}
            disabled={busy || !password}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Initialize database
          </button>
          <span className="text-xs text-slate-400">Required once, after connecting Postgres.</span>
        </div>
      </section>

      {msg ? (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      ) : null}

      {/* Lock toggle */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Submissions</h2>
            <p className="text-sm text-slate-500">
              {settings.locked
                ? "Locked — no new brackets can be submitted."
                : "Open — friends can still submit brackets."}
            </p>
          </div>
          <button
            onClick={toggleLock}
            disabled={busy || !password}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              settings.locked ? "bg-emerald-600" : "bg-amber-600"
            }`}
          >
            {settings.locked ? "Unlock submissions" : "Lock submissions"}
          </button>
        </div>
      </section>

      {/* R32 teams */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Round of 32 teams</h2>
            <p className="text-sm text-slate-500">
              Enter both teams for each of the 16 matches. Code = 2-letter ISO country code for
              the flag (e.g. <code>br</code>, <code>us</code>, <code>fr</code>).
            </p>
          </div>
          <button
            onClick={saveTeams}
            disabled={busy || !password}
            className="rounded-lg bg-pitch px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save teams
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 16 }, (_, i) => `M${i + 1}`).map((mid, idx) => (
            <div key={mid} className="rounded-lg border border-slate-200 p-2">
              <div className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
                Match {idx + 1}
              </div>
              <SlotInputs
                name={draft[mid].aName}
                code={draft[mid].aCode}
                onName={(v) => updateSlot(mid, "aName", v)}
                onCode={(v) => updateSlot(mid, "aCode", v)}
              />
              <div className="my-1 text-center text-[10px] text-slate-300">vs</div>
              <SlotInputs
                name={draft[mid].bName}
                code={draft[mid].bCode}
                onName={(v) => updateSlot(mid, "bName", v)}
                onCode={(v) => updateSlot(mid, "bCode", v)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Official results</h2>
            <p className="text-sm text-slate-500">
              Click the winner of each match as it&apos;s played. Only fill in matches that have
              finished — leave the rest blank.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setResults({})}
              disabled={busy}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Clear all
            </button>
            <button
              onClick={saveResults}
              disabled={busy || !password}
              className="rounded-lg bg-pitch px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save results
            </button>
          </div>
        </div>
        {teamsReady ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <Bracket
              r32Teams={r32Teams}
              picks={results as Picks}
              mode="build"
              onPick={handleResultPick}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Enter and save the teams first.</p>
        )}
      </section>
    </div>
  );
}

function SlotInputs({
  name,
  code,
  onName,
  onCode,
}: {
  name: string;
  code: string;
  onName: (v: string) => void;
  onCode: (v: string) => void;
}) {
  return (
    <div className="flex gap-1">
      <input
        value={name}
        onChange={(e) => onName(e.target.value)}
        placeholder="Team"
        className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-pitch"
      />
      <input
        value={code}
        onChange={(e) => onCode(e.target.value)}
        placeholder="cc"
        maxLength={2}
        className="w-10 rounded border border-slate-300 px-1 py-1 text-center text-sm uppercase outline-none focus:border-pitch"
      />
    </div>
  );
}
