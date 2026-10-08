import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChecklistItem } from "@/components/field/checklist-item";
import { FieldTabs } from "@/components/field/field-tabs";
import { ProgressBar } from "@/components/progress-bar";
import { PROGRESS_STORAGE_KEY } from "@/lib/progress";

describe("ChecklistItem", () => {
  it("toggles and persists to localStorage", () => {
    render(
      <ul>
        <ChecklistItem id="demo:start:learn-sql" label="Learn SQL" />
      </ul>,
    );
    const box = screen.getByRole("checkbox", { name: "Learn SQL" });
    expect(box).not.toBeChecked();

    fireEvent.click(box);
    expect(box).toBeChecked();
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY)!)).toEqual(["demo:start:learn-sql"]);

    fireEvent.click(box);
    expect(box).not.toBeChecked();
    expect(JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY)!)).toEqual([]);
  });

  it("keeps every item with the same id in sync", () => {
    render(
      <ul>
        <ChecklistItem id="demo:skills:git" label="Git (first)" />
        <ChecklistItem id="demo:skills:git" label="Git (second)" />
      </ul>,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Git (first)" }));
    expect(screen.getByRole("checkbox", { name: "Git (second)" })).toBeChecked();
  });
});

describe("FieldTabs", () => {
  const panels = [
    { id: "overview", label: "Overview", content: <p>Overview body</p> },
    { id: "roadmap", label: "Roadmap", content: <p>Roadmap body</p> },
    { id: "salary", label: "Salary", content: <p>Salary body</p> },
  ];

  it("shows the first tab by default and switches on click", () => {
    window.history.replaceState(null, "", "/");
    render(<FieldTabs panels={panels} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Overview body")).toBeVisible();
    expect(screen.getByText("Roadmap body")).not.toBeVisible();

    fireEvent.click(screen.getByRole("tab", { name: "Roadmap" }));
    expect(screen.getByRole("tab", { name: "Roadmap" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Roadmap body")).toBeVisible();
    expect(window.location.hash).toBe("#roadmap");
  });

  it("supports arrow-key navigation", () => {
    window.history.replaceState(null, "", "/");
    render(<FieldTabs panels={panels} />);
    const first = screen.getByRole("tab", { name: "Overview" });
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Salary" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens the tab named in the URL hash", () => {
    window.history.replaceState(null, "", "/#salary");
    render(<FieldTabs panels={panels} />);
    expect(screen.getByRole("tab", { name: "Salary" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("ProgressBar", () => {
  it("clamps and exposes an accessible value", () => {
    render(<ProgressBar percent={140} label="Demo progress" />);
    expect(screen.getByRole("progressbar", { name: "Demo progress" })).toHaveAttribute("aria-valuenow", "100");
  });
});
