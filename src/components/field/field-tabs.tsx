"use client";

import { useCallback, useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

export interface TabPanel {
  id: string;
  label: string;
  content: ReactNode;
}

/* The active tab lives in the URL hash (#roadmap) so tabs are linkable and survive reloads. */
const HASH_EVENT = "careerpulse:hashchange";

function subscribeHash(listener: () => void) {
  window.addEventListener("hashchange", listener);
  window.addEventListener(HASH_EVENT, listener);
  return () => {
    window.removeEventListener("hashchange", listener);
    window.removeEventListener(HASH_EVENT, listener);
  };
}

const getHash = () => window.location.hash.slice(1);
const getServerHash = () => "";

export function FieldTabs({ panels }: { panels: TabPanel[] }) {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const active = panels.some((p) => p.id === hash) ? hash : panels[0].id;
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = useCallback((id: string, focus = false) => {
    window.history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new Event(HASH_EVENT));
    const tab = tabRefs.current[id];
    if (tab) {
      if (focus) tab.focus();
      tab.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = panels.findIndex((p) => p.id === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % panels.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + panels.length) % panels.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = panels.length - 1;
    if (next >= 0) {
      e.preventDefault();
      select(panels[next].id, true);
    }
  };

  return (
    <div>
      <div
        className="border-line bg-bg/90 sticky top-14 z-30 -mx-4 border-b px-4 backdrop-blur-md sm:-mx-6 sm:px-6"
        data-print-hide
      >
        <div
          role="tablist"
          aria-label="Field sections"
          onKeyDown={onKeyDown}
          className="no-scrollbar flex gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_85%,transparent)] py-2 lg:flex-wrap lg:overflow-visible lg:[mask-image:none]"
        >
          {panels.map((p) => {
            const selected = p.id === active;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  tabRefs.current[p.id] = el;
                }}
                id={`tab-${p.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`panel-${p.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(p.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  selected ? "bg-accent text-accent-fg" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {panels.map((p) => (
        <div
          key={p.id}
          id={`panel-${p.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${p.id}`}
          hidden={p.id !== active}
          tabIndex={0}
          className="pt-8 outline-none"
        >
          {p.content}
        </div>
      ))}
    </div>
  );
}
