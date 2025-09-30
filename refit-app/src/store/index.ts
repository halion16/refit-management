// ZUSTAND STORE FOR GLOBAL STATE MANAGEMENT

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import type { Location, Project, Contractor, Quote, User } from '@/types';

// App State Interface
interface AppState {
  // UI State
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'locations' | 'projects' | 'contractors' | 'quotes' | 'calendar' | 'appointments' | 'tasks' | 'reports' | 'documents' | 'photos' | 'settings';
  darkMode: boolean;

  // User State
  currentUser: User | null;
  isAuthenticated: boolean;

  // Data State
  selectedLocation: Location | null;
  selectedProject: Project | null;
  selectedContractor: Contractor | null;

  // Filter State
  filters: {
    projects: {
      status?: string;
      priority?: string;
      location?: string;
    };
    contractors: {
      status?: string;
      specialization?: string;
    };
    quotes: {
      status?: string;
      project?: string;
    };
  };

  // Search State
  searchQuery: string;
  searchResults: any[];

  // Actions
  toggleSidebar: () => void;
  setCurrentView: (view: AppState['currentView']) => void;
  toggleDarkMode: () => void;

  // User Actions
  setCurrentUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;

  // Selection Actions
  setSelectedLocation: (location: Location | null) => void;
  setSelectedProject: (project: Project | null) => void;
  setSelectedContractor: (contractor: Contractor | null) => void;

  // Filter Actions
  setProjectFilters: (filters: Partial<AppState['filters']['projects']>) => void;
  setContractorFilters: (filters: Partial<AppState['filters']['contractors']>) => void;
  setQuoteFilters: (filters: Partial<AppState['filters']['quotes']>) => void;
  clearFilters: () => void;

  // Search Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  clearSearch: () => void;

  // Reset Actions
  resetState: () => void;
}

// Initial State
const initialState = {
  // UI State
  sidebarOpen: true,
  currentView: 'dashboard' as const,
  darkMode: false,

  // User State
  currentUser: null,
  isAuthenticated: false,

  // Data State
  selectedLocation: null,
  selectedProject: null,
  selectedContractor: null,

  // Filter State
  filters: {
    projects: {},
    contractors: {},
    quotes: {}
  },

  // Search State
  searchQuery: '',
  searchResults: []
};

// Create Store with Persistence
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // UI Actions
        toggleSidebar: () => set((state) => ({
          sidebarOpen: !state.sidebarOpen
        })),

        setCurrentView: (view) => set({ currentView: view }),

        toggleDarkMode: () => set((state) => ({
          darkMode: !state.darkMode
        })),

        // User Actions
        setCurrentUser: (user) => set({
          currentUser: user,
          isAuthenticated: !!user
        }),

        login: (user) => set({
          currentUser: user,
          isAuthenticated: true
        }),

        logout: () => set({
          currentUser: null,
          isAuthenticated: false,
          selectedLocation: null,
          selectedProject: null,
          selectedContractor: null
        }),

        // Selection Actions
        setSelectedLocation: (location) => set({ selectedLocation: location }),
        setSelectedProject: (project) => set({ selectedProject: project }),
        setSelectedContractor: (contractor) => set({ selectedContractor: contractor }),

        // Filter Actions
        setProjectFilters: (filters) => set((state) => ({
          filters: {
            ...state.filters,
            projects: { ...state.filters.projects, ...filters }
          }
        })),

        setContractorFilters: (filters) => set((state) => ({
          filters: {
            ...state.filters,
            contractors: { ...state.filters.contractors, ...filters }
          }
        })),

        setQuoteFilters: (filters) => set((state) => ({
          filters: {
            ...state.filters,
            quotes: { ...state.filters.quotes, ...filters }
          }
        })),

        clearFilters: () => set({
          filters: {
            projects: {},
            contractors: {},
            quotes: {}
          }
        }),

        // Search Actions
        setSearchQuery: (query) => set({ searchQuery: query }),
        setSearchResults: (results) => set({ searchResults: results }),
        clearSearch: () => set({ searchQuery: '', searchResults: [] }),

        // Reset Actions
        resetState: () => set(initialState)
      }),
      {
        name: 'refit-app-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          sidebarOpen: state.sidebarOpen,
          darkMode: state.darkMode,
          currentUser: state.currentUser,
          isAuthenticated: state.isAuthenticated
        })
      }
    ),
    {
      name: 'refit-app-store'
    }
  )
);

// Selectors for better performance with shallow comparison
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useDarkMode = () => useAppStore((state) => state.darkMode);
export const useSelectedLocation = () => useAppStore((state) => state.selectedLocation);
export const useSelectedProject = () => useAppStore((state) => state.selectedProject);
export const useSelectedContractor = () => useAppStore((state) => state.selectedContractor);
export const useFilters = () => useAppStore((state) => state.filters);
export const useSearchQuery = () => useAppStore((state) => state.searchQuery);
export const useSearchResults = () => useAppStore((state) => state.searchResults);

// Individual action hooks to prevent SSR issues
export const useToggleSidebar = () => useAppStore((state) => state.toggleSidebar);
export const useSetCurrentView = () => useAppStore((state) => state.setCurrentView);
export const useToggleDarkMode = () => useAppStore((state) => state.toggleDarkMode);
export const useLogin = () => useAppStore((state) => state.login);
export const useLogout = () => useAppStore((state) => state.logout);
export const useSetSelectedLocation = () => useAppStore((state) => state.setSelectedLocation);
export const useSetSelectedProject = () => useAppStore((state) => state.setSelectedProject);
export const useSetSelectedContractor = () => useAppStore((state) => state.setSelectedContractor);
export const useSetProjectFilters = () => useAppStore((state) => state.setProjectFilters);
export const useSetContractorFilters = () => useAppStore((state) => state.setContractorFilters);
export const useSetQuoteFilters = () => useAppStore((state) => state.setQuoteFilters);
export const useClearFilters = () => useAppStore((state) => state.clearFilters);
export const useSetSearchQuery = () => useAppStore((state) => state.setSearchQuery);
export const useSetSearchResults = () => useAppStore((state) => state.setSearchResults);
export const useClearSearch = () => useAppStore((state) => state.clearSearch);
export const useResetState = () => useAppStore((state) => state.resetState);

// Dashboard Store for KPIs and stats
interface DashboardState {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    spentBudget: number;
    totalStores: number;
    activeContractors: number;
    pendingQuotes: number;
  };
  recentActivity: any[];
  updateStats: (stats: Partial<DashboardState['stats']>) => void;
  setRecentActivity: (activity: any[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      stats: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalBudget: 0,
        spentBudget: 0,
        totalStores: 0,
        activeContractors: 0,
        pendingQuotes: 0
      },
      recentActivity: [],

      updateStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats }
      })),

      setRecentActivity: (activity) => set({ recentActivity: activity })
    }),
    { name: 'dashboard-store' }
  )
);