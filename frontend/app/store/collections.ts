import { create } from "zustand";
import axios from "axios";

type S = {
  collections: string[];
  loading: boolean;
  fetchCollections: () => Promise<void>;
};

export const useCollectionStore = create<S>((set) => ({
  collections: [],
  loading: false,

  fetchCollections: async () => {
    set({ loading: true });
    try {
      const r = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/collections`,
      );

      const data = r.data; // backend returns: ["demo_collection", ... ]

      const names = Array.isArray(data)
        ? data.map((x: any) => (typeof x === "string" ? x : x.name))
        : [];

      set({ collections: names, loading: false });
    } catch {
      set({ collections: [], loading: false });
    }
  },
}));
