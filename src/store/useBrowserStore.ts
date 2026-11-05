import { create } from 'zustand';
import type { BrowserStoreState, Tab, ActivePage } from '../types';

const defaultTab: Tab = {
  id: 'tab-1',
  title: 'New Tab',
  url: '',
  isLoading: false,
  canGoBack: false,
  canGoForward: false,
  isAgentActive: false,
};

export const useBrowserStore = create<BrowserStoreState>((set, get) => ({
  // Active Navigation Page
  activePage: 'single-browser',

  // Initial Tab State
  tabs: [defaultTab],
  activeTabId: defaultTab.id,

  // Initial Dynamic Island State
  island: {
    status: 'idle',
    message: '',
    details: undefined,
    isExpanded: false,
  },

  // Omnibar
  isOmnibarOpen: false,
  omnibarQuery: '',

  // Sidebar
  isSidebarCollapsed: false,

  // Agent Defaults
  selectedModel: 'magic',

  // Actions
  setActivePage: (page: ActivePage) => set({ activePage: page }),

  openTab: (url = '', title = 'New Tab') => {
    const newTab: Tab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      url,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isAgentActive: false,
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
  },

  closeTab: (id) => {
    set((state) => {
      if (state.tabs.length <= 1) {
        return {
          tabs: [{ id: `tab-${Date.now()}`, title: 'New Tab', url: '' }],
          activeTabId: `tab-${Date.now()}`,
        };
      }
      const newTabs = state.tabs.filter((t) => t.id !== id);
      const nextActiveId =
        state.activeTabId === id
          ? newTabs[newTabs.length - 1].id
          : state.activeTabId;
      return {
        tabs: newTabs,
        activeTabId: nextActiveId,
      };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  toggleHibernateTab: (id: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id
          ? {
              ...tab,
              isHibernated: !tab.isHibernated,
              hibernatedDuration: !tab.isHibernated ? '26hrs 32mins' : undefined,
            }
          : tab
      ),
    }));
  },

  updateTab: (id, updates) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab
      ),
    }));
  },

  navigateActiveTab: (url) => {
    set((state) => {
      const formattedUrl =
        url.startsWith('http://') || url.startsWith('https://')
          ? url
          : url.includes('.') && !url.includes(' ')
          ? `https://${url}`
          : `https://www.google.com/search?q=${encodeURIComponent(url)}`;

      if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.navigate(formattedUrl);
      }

      return {
        tabs: state.tabs.map((tab) =>
          tab.id === state.activeTabId
            ? {
                ...tab,
                url: formattedUrl,
                title: url.replace(/^https?:\/\//, '').split('/')[0] || url,
                canGoBack: true,
              }
            : tab
        ),
      };
    });
  },

  goBack: () => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);

    if (typeof window !== 'undefined' && window.electronAPI && activeTab?.canGoBack) {
      window.electronAPI.goBack();
    } else {
      // If at start of history or in web mode, return to Zen Home
      get().goHome();
    }
  },

  goForward: () => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);

    if (typeof window !== 'undefined' && window.electronAPI && activeTab?.canGoForward) {
      window.electronAPI.goForward();
    }
  },

  reload: () => {
    const { tabs, activeTabId, updateTab } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);

    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.reload();
    } else if (activeTab?.url) {
      // Trigger reload state for web mode
      updateTab(activeTabId, { isLoading: true });
      setTimeout(() => updateTab(activeTabId, { isLoading: false }), 600);
    }
  },

  goHome: () => {
    const { activeTabId, updateTab } = get();
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.hideWebview();
    }
    updateTab(activeTabId, {
      url: '',
      title: 'New Tab',
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
    });
  },

  setIslandState: (updates) => {
    set((state) => ({
      island: {
        ...state.island,
        ...updates,
      },
    }));
  },

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  toggleOmnibar: (open) =>
    set((state) => ({
      isOmnibarOpen: open !== undefined ? open : !state.isOmnibarOpen,
    })),

  setOmnibarQuery: (query) => set({ omnibarQuery: query }),
}));
