import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company, FundThesis, SavedList, SavedSearch, CompanyFilters } from "@/types";

interface AppState {
  // Thesis
  activeTesis: FundThesis | null;
  setActiveThesis: (thesis: FundThesis | null) => void;

  // Lists
  lists: SavedList[];
  createList: (name: string, description?: string) => void;
  deleteList: (id: string) => void;
  addToList: (listId: string, companyId: string) => void;
  removeFromList: (listId: string, companyId: string) => void;

  // Saved searches
  savedSearches: SavedSearch[];
  saveSearch: (name: string, filters: CompanyFilters) => void;
  deleteSavedSearch: (id: string) => void;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Enrichment loading
  enrichingIds: Set<string>;
  setEnriching: (id: string, loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTesis: null,
      setActiveThesis: (thesis) => set({ activeTesis: thesis }),

      lists: [],
      createList: (name, description = "") =>
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id: crypto.randomUUID(),
              name,
              description,
              companyIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      deleteList: (id) =>
        set((state) => ({ lists: state.lists.filter((l) => l.id !== id) })),
      addToList: (listId, companyId) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId && !l.companyIds.includes(companyId)
              ? { ...l, companyIds: [...l.companyIds, companyId], updatedAt: new Date().toISOString() }
              : l
          ),
        })),
      removeFromList: (listId, companyId) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, companyIds: l.companyIds.filter((c) => c !== companyId), updatedAt: new Date().toISOString() }
              : l
          ),
        })),

      savedSearches: [],
      saveSearch: (name, filters) =>
        set((state) => ({
          savedSearches: [
            ...state.savedSearches,
            {
              id: crypto.randomUUID(),
              name,
              filters,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      deleteSavedSearch: (id) =>
        set((state) => ({ savedSearches: state.savedSearches.filter((s) => s.id !== id) })),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      enrichingIds: new Set(),
      setEnriching: (id, loading) =>
        set((state) => {
          const next = new Set(state.enrichingIds);
          loading ? next.add(id) : next.delete(id);
          return { enrichingIds: next };
        }),
    }),
    {
      name: "vc-sourcing-store",
      partialize: (state) => ({
        activeTesis: state.activeTesis,
        lists: state.lists,
        savedSearches: state.savedSearches,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);