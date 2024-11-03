import { create } from "zustand";
import { Match, BatchUpdate } from "@/types";

interface ScheduleState {
  selectedMatches: number[];
  lastUpdate: BatchUpdate | null;
  setSelectedMatches: (matches: number[]) => void;
  addSelectedMatch: (matchId: number) => void;
  removeSelectedMatch: (matchId: number) => void;
  clearSelection: () => void;
  setLastUpdate: (update: BatchUpdate | null) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedMatches: [],
  lastUpdate: null,
  setSelectedMatches: (matches) => set({ selectedMatches: matches }),
  addSelectedMatch: (matchId) =>
    set((state) => ({
      selectedMatches: [...state.selectedMatches, matchId],
    })),
  removeSelectedMatch: (matchId) =>
    set((state) => ({
      selectedMatches: state.selectedMatches.filter((id) => id !== matchId),
    })),
  clearSelection: () => set({ selectedMatches: [] }),
  setLastUpdate: (update) => set({ lastUpdate: update }),
}));
