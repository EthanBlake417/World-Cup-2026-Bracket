"use client";

import Flag from "./Flag";
import type { Team } from "@/lib/bracket";

type Props = {
  label?: string;
  a: Team | null;
  b: Team | null;
  picked?: string; // picked winner name
  actual?: string; // official winner name (view mode)
  mode: "build" | "view";
  disabled?: boolean;
  onPick?: (name: string) => void;
};

export default function MatchCard({
  label,
  a,
  b,
  picked,
  actual,
  mode,
  disabled,
  onPick,
}: Props) {
  return (
    <div className="w-44 rounded-md border border-slate-300 bg-white shadow-sm">
      {label ? (
        <div className="border-b border-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </div>
      ) : null}
      <Slot
        team={a}
        picked={picked}
        actual={actual}
        mode={mode}
        disabled={disabled}
        onPick={onPick}
      />
      <div className="h-px bg-slate-200" />
      <Slot
        team={b}
        picked={picked}
        actual={actual}
        mode={mode}
        disabled={disabled}
        onPick={onPick}
      />
    </div>
  );
}

function Slot({
  team,
  picked,
  actual,
  mode,
  disabled,
  onPick,
}: {
  team: Team | null;
  picked?: string;
  actual?: string;
  mode: "build" | "view";
  disabled?: boolean;
  onPick?: (name: string) => void;
}) {
  const isPicked = !!team && picked === team.name;

  // Colour logic for view mode once results exist.
  let stateClass = "";
  if (mode === "view" && isPicked && actual) {
    stateClass =
      picked === actual
        ? "bg-green-600 text-white" // correct = green fill
        : "bg-red-600 text-white"; // incorrect = red fill
  } else if (isPicked) {
    stateClass = "bg-blue-600 text-white"; // prediction = blue fill
  }

  const clickable = mode === "build" && !!team && !disabled;

  const content = (
    <div className="flex items-center gap-1.5">
      <Flag code={team?.code} />
      <span className="truncate text-xs font-medium">
        {team?.name ?? <span className="text-slate-300">—</span>}
      </span>
    </div>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={() => team && onPick?.(team.name)}
        className={`block w-full px-2 py-1.5 text-left transition hover:bg-blue-50 ${stateClass}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`px-2 py-1.5 ${stateClass}`}>{content}</div>;
}
