"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type MultiSelectOption = {
  value: string;
  label: string;
};

export function MultiSelectFilter({
  id,
  name,
  label,
  options,
  defaultValues = [],
  hint,
}: {
  id: string;
  name: string;
  label: string;
  options: MultiSelectOption[];
  defaultValues?: string[];
  hint?: string;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [selectedCount, setSelectedCount] = useState(defaultValues.length);

  function setEveryOption(selected: boolean) {
    const select = selectRef.current;
    if (!select) return;
    for (const option of select.options) option.selected = selected;
    setSelectedCount(selected ? select.options.length : 0);
  }

  return (
    <div className="space-y-2">
      <div className="flex min-h-6 items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setEveryOption(true)} disabled={!options.length || selectedCount === options.length}>
            Select all
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setEveryOption(false)} disabled={selectedCount === 0}>
            Clear
          </Button>
        </div>
      </div>
      <select
        ref={selectRef}
        id={id}
        name={name}
        multiple
        defaultValue={defaultValues}
        onChange={(event) => setSelectedCount(event.currentTarget.selectedOptions.length)}
        className="h-36 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
