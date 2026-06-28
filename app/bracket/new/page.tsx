"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Bracket from "@/components/Bracket";
import {
  MATCHES,
  isComplete,
  prunePicks,
  type Picks,
  type R32Teams,
  type Settings,
} from "@/lib/bracket";

const DRAFT_KEY = "wc2026-draft";

export default function NewBracketPage() {
  const router = useRouter();
  const [r32Teams, setR32Teams] = useState<R32Teams | null>(null);
  const [settings, setSettings] = useState<Settings>({ locked: false });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [picks, setPicks] = useState<Picks>({});
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load config + any saved draft.
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setLoadError(d.error);
          return;
        }
        setR32Teams(d.r32Teams);
        setSettings(d.settings ?? { locked: false });
      })
      .catch(() => setLoadError("Couldn't load the tournament. Try again."));

    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.picks) setPicks(parsed.picks);
        if (parsed?.name) setName(parsed.name);
      }
    } catch {
      /* ignore bad draft */
    }
  }, []);

  // Persist draft as the user works.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ picks, name }));
    } catch {
      /* storage might be unavailable */
    }
  }, [picks, name]);

  const teamsReady = useMemo(
    () =>
      !!r32Teams &&
      Object.values(r32Teams).some((slot) => slot?.a || slot?.b),
    [r32Teams],
  );

  const pickedCount = useMemo(
    () => MATCHES.filter((m) => picks[m.id]).length,
    [picks],
  );
  const complete = isComplete(picks);

  function handlePick(matchId: string, teamName: string) {
    if (!r32Teams) return;
    setPicks((prev) => prunePicks({ ...prev, [matchId]: teamName }, r32Teams));
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!name.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!complete) {
      setSubmitError("Finish picking a winner for every match first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), picks }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/bracket/${data.id}`);
    } catch {
      setSubmitError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
        <p className="font-semibold">{loadError}</p>
        <p className="mt-1 text-sm">
          The organizer may still be setting things up. Check back soon, or see the{" "}
          <Link href="/admin" className="underline">
            admin page
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!r32Teams) {
    return <p className="text-slate-500">Loading bracket…</p>;
  }

  if (settings.locked) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-900">
        <p className="font-semibold">🔒 Submissions are locked.</p>
        <p className="mt-1 text-sm">
          The tournament has started, so new brackets can&apos;t be submitted. Head to the{" "}
          <Link href="/leaderboard" className="underline">
            leaderboard
          </Link>{" "}
          to follow along.
        </p>
      </div>
    );
  }

  if (!teamsReady) {
    return (
      <div className="rounded-lg border border-slate-300 bg-white p-5">
        <p className="font-semibold">The bracket isn&apos;t set up yet.</p>
        <p className="mt-1 text-sm text-slate-600">
          The organizer still needs to enter the 32 teams. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Build your bracket</h1>
          <p className="text-sm text-slate-500">
            Click a team to advance them. Changing an earlier winner resets the picks that
            depended on it.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-500">
            {pickedCount} / {MATCHES.length} picked
          </div>
          <div className="mt-1 h-2 w-40 overflow-hidden rounded bg-slate-200">
            <div
              className="h-full bg-pitch transition-all"
              style={{ width: `${(pickedCount / MATCHES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Bracket r32Teams={r32Teams} picks={picks} mode="build" onPick={handlePick} />
      </div>

      <div className="sticky bottom-0 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={40}
            className="w-56 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-pitch focus:ring-1 focus:ring-pitch"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !complete || !name.trim()}
            className="rounded-lg bg-pitch px-5 py-2 font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit bracket"}
          </button>
          {!complete ? (
            <span className="text-sm text-slate-500">
              Pick all {MATCHES.length} matches to submit.
            </span>
          ) : null}
          {submitError ? (
            <span className="text-sm font-medium text-red-600">{submitError}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
