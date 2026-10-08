"use client";

import { useSyncExternalStore } from "react";
import { parseStringList } from "@/lib/progress";

/*
 * A tiny localStorage-backed store for a list of strings.
 * useSyncExternalStore keeps every subscriber in sync (including other tabs via
 * the `storage` event) and renders an empty, stable snapshot on the server.
 * If storage is blocked (private mode, disabled site data) the list lives in
 * memory for the session so the UI still works.
 */

export interface ListStore {
  useList: () => readonly string[];
  get: () => readonly string[];
  set: (next: readonly string[]) => void;
}

const EMPTY: readonly string[] = Object.freeze([]);

export function createListStore(key: string): ListStore {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedList: readonly string[] = EMPTY;
  let memoryRaw: string | null = null;
  let storageAvailable = true;

  function readRaw(): string | null {
    if (!storageAvailable) return memoryRaw;
    try {
      return window.localStorage.getItem(key);
    } catch {
      storageAvailable = false;
      return memoryRaw;
    }
  }

  function get(): readonly string[] {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedList = Object.freeze(parseStringList(raw));
    }
    return cachedList;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function set(next: readonly string[]) {
    const raw = JSON.stringify(next);
    memoryRaw = raw;
    if (storageAvailable) {
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        storageAvailable = false;
      }
    }
    listeners.forEach((l) => l());
  }

  function useList() {
    return useSyncExternalStore(subscribe, get, () => EMPTY);
  }

  return { useList, get, set };
}
