"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import {
  AlertCircle,
  Check,
  ImagePlus,
  KeyRound,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { PerformerKind } from "@/lib/categories";

export interface SlotData {
  category: PerformerKind;
  label: string;
  color: string;
  playerId: string;
  playerName: string;
  teamAbbr: string;
  statLabel: string;
  currentPhoto: string | null;
}

export interface GameSlots {
  id: string;
  label: string;
  date: string;
  league: string;
  slots: SlotData[];
}

export function UploadDesk({ games }: { games: GameSlots[] }) {
  const [passcode, setPasscode] = useState("");
  const [selectedId, setSelectedId] = useState(games[0]?.id ?? "");
  const selected = games.find((g) => g.id === selectedId) ?? games[0];

  const unlocked = passcode.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* passcode */}
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-fg">Statistician passcode</p>
            <p className="text-sm text-muted">
              Required to publish. Demo passcode:{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-accent">courtside</code>
            </p>
          </div>
        </div>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter passcode"
          className="w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent sm:w-64"
        />
      </div>

      {/* game selector */}
      <div>
        <p className="eyebrow mb-3">Select a game</p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              className={clsx(
                "shrink-0 rounded-xl border px-4 py-3 text-left transition-colors",
                g.id === selectedId
                  ? "border-accent bg-accent/10"
                  : "border-line hover:border-faint"
              )}
            >
              <span className="block text-sm font-semibold text-fg">{g.label}</span>
              <span className="block text-xs text-faint">
                {g.league} · {g.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* slots */}
      {selected && (
        <div>
          <p className="eyebrow mb-3">Performers · {selected.label}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selected.slots.map((slot) => (
              <SlotCard
                key={`${selected.id}-${slot.category}`}
                gameId={selected.id}
                slot={slot}
                passcode={passcode}
                disabled={!unlocked}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Status = "idle" | "uploading" | "success" | "error";

function SlotCard({
  gameId,
  slot,
  passcode,
  disabled,
}: {
  gameId: string;
  slot: SlotData;
  passcode: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<string | null>(slot.currentPhoto);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  function choose(f: File | null) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setMessage("");
  }

  async function upload() {
    if (!file) return;
    setStatus("uploading");
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("passcode", passcode);
      fd.append("gameId", gameId);
      fd.append("category", slot.category);
      fd.append("playerId", slot.playerId);
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? "Upload failed.");
        return;
      }
      setPhoto(json.url);
      setPreview(null);
      setFile(null);
      setStatus("success");
      setMessage("Published to the site.");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  const shown = preview ?? photo;

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-2">
        {shown ? (
          <Avatar name={slot.playerName} src={shown} rounded="rounded-none" className="h-full w-full" />
        ) : (
          <div className="grid h-full place-items-center text-faint">
            <div className="text-center">
              <ImagePlus className="mx-auto h-8 w-8" />
              <p className="mt-2 text-xs">No photo yet</p>
            </div>
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-bold text-black"
          style={{ background: slot.color }}
        >
          {slot.label}
        </span>
        {photo && !preview && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-good/20 px-2 py-1 text-[0.65rem] font-semibold text-good">
            <Check className="h-3 w-3" /> Live
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="truncate font-semibold text-fg">{slot.playerName}</p>
        <p className="text-xs text-faint">
          {slot.teamAbbr} · {slot.statLabel}
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-fg transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            {file ? "Change" : "Choose photo"}
          </button>
          <button
            onClick={upload}
            disabled={disabled || !file || status === "uploading"}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "uploading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Upload
          </button>
        </div>

        {message && (
          <p
            className={clsx(
              "mt-3 flex items-center gap-1.5 text-xs",
              status === "error" ? "text-bad" : "text-good"
            )}
          >
            {status === "error" ? (
              <AlertCircle className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {message}
          </p>
        )}
        {disabled && (
          <p className="mt-3 text-xs text-faint">Enter the passcode above to enable uploads.</p>
        )}
      </div>
    </div>
  );
}
