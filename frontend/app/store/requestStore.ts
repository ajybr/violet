import { create } from "zustand";
import { v4 as uuid } from "uuid";

type Log = {
  status?: number;
  id: string;
  route: string;
  method: string;
  req: any;
  res: any;
  ms: number;
  time: string;
};
type S = {
  logs: Log[];
  push: (l: Log) => void;
};

export const useRequestStore = create<S>((set) => ({
  logs: [],
  push: (l) => set((s) => ({ logs: [l, ...s.logs] })),
}));
