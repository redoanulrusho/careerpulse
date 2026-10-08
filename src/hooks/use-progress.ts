"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { PROGRESS_STORAGE_KEY, clearField, toggleId } from "@/lib/progress";
import { createListStore } from "./create-list-store";

const progressStore = createListStore(PROGRESS_STORAGE_KEY);

/** Checked checklist item IDs, persisted in this browser. */
export function useProgress() {
  const list = progressStore.useList();
  const checked = useMemo<ReadonlySet<string>>(() => new Set(list), [list]);

  const toggle = useCallback((id: string) => {
    progressStore.set(toggleId(progressStore.get(), id));
  }, []);

  const resetField = useCallback((slug: string) => {
    progressStore.set(clearField(progressStore.get(), slug));
  }, []);

  const resetAll = useCallback(() => progressStore.set([]), []);

  return { checked, toggle, resetField, resetAll };
}

function noopSubscribe() {
  return () => {};
}

/** True after hydration — lets UI avoid showing misleading "0%" before storage is read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
