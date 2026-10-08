"use client";

import { Check } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

/** A checkbox row whose state is saved in the browser (see hooks/use-progress). */
export function ChecklistItem({ id, label }: { id: string; label: string }) {
  const { checked, toggle } = useProgress();
  const isChecked = checked.has(id);
  return (
    <li>
      <label className="group hover:bg-surface-2 flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 transition">
        <input type="checkbox" className="peer sr-only" checked={isChecked} onChange={() => toggle(id)} />
        <span
          aria-hidden="true"
          className={`peer-focus-visible:ring-ring mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition peer-focus-visible:ring-2 ${
            isChecked ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface group-hover:border-accent"
          }`}
        >
          {isChecked && <Check className="size-3.5" strokeWidth={3} />}
        </span>
        <span className={`text-sm leading-relaxed ${isChecked ? "text-muted line-through" : ""}`}>{label}</span>
      </label>
    </li>
  );
}
