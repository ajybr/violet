import { create } from "zustand";

export type LogItem = {
  status?: number;
  id: string;
  method: string;
  route: string;
  req: any;
  res: any;
  ms: number;
  time: string;
};

export const useLogStore = create<{
  logs: LogItem[];
  push: (l: LogItem) => void;
  clear: () => void;
}>((set) => ({
  logs: [],
  push: (l) => set((s) => ({ logs: [l, ...s.logs] })),
  clear: () => set({ logs: [] }),
}));
