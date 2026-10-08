"use client";

import { useCallback } from "react";
import { MAX_COMPARE } from "@/lib/compare";
import { createListStore } from "./create-list-store";

const trayStore = createListStore("careerpulse:compare:v1");

/** Fields the user picked for comparison (max 3), persisted in this browser. */
export function useCompareTray() {
  const slugs = trayStore.useList();

  const toggle = useCallback((slug: string) => {
    const current = trayStore.get();
    if (current.includes(slug)) {
      trayStore.set(current.filter((s) => s !== slug));
    } else if (current.length < MAX_COMPARE) {
      trayStore.set([...current, slug]);
    } else {
      // Tray is full: drop the oldest pick so the newest choice always lands.
      trayStore.set([...current.slice(1), slug]);
    }
  }, []);

  const replace = useCallback((next: string[]) => {
    trayStore.set(next.slice(0, MAX_COMPARE));
  }, []);

  const clear = useCallback(() => trayStore.set([]), []);

  return { slugs, toggle, replace, clear, isFull: slugs.length >= MAX_COMPARE };
}
