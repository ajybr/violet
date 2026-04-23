import { create } from "zustand";

export type Tab = "collections" | "docs" | "search" | "home";

interface UIState {
  tab: Tab;
  setTab: (t: Tab) => void;
}

export const useUI = create<UIState>((set) => ({
  tab: "collections",
  setTab: (t) => set({ tab: t }),
}));
