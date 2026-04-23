import { create } from "zustand";
type Log = {
  id: string;
  route: string;
  req: any;
  res: any;
  ms: number;
  time: string;
};
type State = { logs: Log[]; push: (l: Log) => void; clear: () => void };
export const useStore = create<State>((set) => ({
  logs: [],
  push: (l) => set((s) => ({ logs: [l, ...s.logs].slice(0, 200) })),
  clear: () => set({ logs: [] }),
}));
