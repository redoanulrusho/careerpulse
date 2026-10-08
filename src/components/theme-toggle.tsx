"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, nextPreference, resolveTheme, type ThemePreference } from "@/lib/theme";

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  const attr = document.documentElement.getAttribute("data-theme-pref");
  return attr === "light" || attr === "dark" ? attr : "system";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply(pref: ThemePreference) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const root = document.documentElement;
  root.setAttribute("data-theme", resolveTheme(pref, systemDark));
  root.setAttribute("data-theme-pref", pref);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage blocked: the theme still applies for this page view.
  }
  listeners.forEach((l) => l());
}

const LABEL: Record<ThemePreference, string> = {
  light: "Light theme",
  dark: "Dark theme",
  system: "System theme",
};

export function ThemeToggle() {
  // Server snapshot is "system"; the inline script has already set the real theme on <html>.
  const pref = useSyncExternalStore(subscribe, readPreference, () => "system" as const);

  // Follow OS changes while in "system" mode.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const cycle = useCallback(() => apply(nextPreference(readPreference())), []);
  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      className="border-line bg-surface text-muted hover:text-fg inline-flex size-9 items-center justify-center rounded-lg border transition"
      aria-label={`${LABEL[pref]} (click to change)`}
      title={`${LABEL[pref]} — click to change`}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
