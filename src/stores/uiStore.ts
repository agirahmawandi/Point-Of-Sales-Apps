import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  isSidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: (collapsed: boolean) => void;
  expandSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  isSidebarOpen: false,
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen,
    isSidebarOpen: !state.sidebarOpen 
  })),
  collapseSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),
  expandSidebar: () => set({ sidebarCollapsed: false }),
}));
