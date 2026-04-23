import { create } from "zustand";

type Sel = {
  selected: string;
  setSelected: (v: string) => void;
};

export const useSelectedCollection = create<Sel>((set) => ({
  selected: "",
  setSelected: (v) => set({ selected: v }),
}));
