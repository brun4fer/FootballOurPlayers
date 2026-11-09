"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function TrainingParticipantsField({
  players,
  defaultSelectedIds,
}: {
  players: Array<{ id: number; name: string }>;
  defaultSelectedIds?: number[];
}) {
  const [selected, setSelected] = useState(() => new Set(defaultSelectedIds ?? players.map((player) => player.id)));

  function toggle(playerId: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Players participating ({selected.size}/{players.length})</p>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setSelected(new Set(players.map((player) => player.id)))}>Select all</Button>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      </div>
      <div className="grid max-h-64 gap-2 overflow-y-auto rounded-lg border border-border bg-background/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((player) => (
          <label key={player.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-accent/30">
            <input type="checkbox" name="playerIds" value={player.id} checked={selected.has(player.id)} onChange={() => toggle(player.id)} className="h-4 w-4 accent-cyan-400" />
            <span className="truncate">{player.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
