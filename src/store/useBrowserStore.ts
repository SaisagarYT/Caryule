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
    const newTabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let favicon: string | undefined = undefined;
    if (url) {
      try {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        if (domain) {
          favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        }
      } catch {
        // ignore
      }
    }
    const newTab: Tab = {
      id: newTabId,
      title,
      url,
      favicon,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      isAgentActive: false,
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTabId,
    }));

    if (typeof window !== 'undefined' && window.electronAPI) {
      if (url) {
        window.electronAPI.navigate(newTabId, url);
      } else {
        window.electronAPI.switchTab(newTabId);
      }
    }
  },

  closeTab: (id) => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.closeTab(id);
    }
    set((state) => {
      if (state.tabs.length <= 1) {
        const resetId = `tab-${Date.now()}`;
        if (typeof window !== 'undefined' && window.electronAPI) {
          window.electronAPI.hideWebview();
        }
        return {
          tabs: [{ id: resetId, title: 'New Tab', url: '' }],
          activeTabId: resetId,
        };
      }
      const newTabs = state.tabs.filter((t) => t.id !== id);
      const nextActiveId =
        state.activeTabId === id
          ? newTabs[newTabs.length - 1].id
          : state.activeTabId;

      if (typeof window !== 'undefined' && window.electronAPI && state.activeTabId === id) {
        window.electronAPI.switchTab(nextActiveId);
      }

      return {
        tabs: newTabs,
        activeTabId: nextActiveId,
      };
    });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.switchTab(id);
    }
  },

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
    const { activeTabId } = get();
    const formattedUrl =
      url.startsWith('http://') || url.startsWith('https://')
        ? url
        : url.includes('.') && !url.includes(' ')
        ? `https://${url}`
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`;

    let domain = '';
    try {
      domain = new URL(formattedUrl).hostname.replace(/^www\./, '');
    } catch {
      domain = '';
    }
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : undefined;

    let cleanTitle = url;
    if (domain) {
      if (domain.includes('google')) cleanTitle = 'Google';
      else if (domain.includes('youtube')) cleanTitle = 'YouTube';
      else if (domain.includes('github')) cleanTitle = 'GitHub';
      else if (domain.includes('wikipedia')) cleanTitle = 'Wikipedia';
      else if (domain.includes('reddit')) cleanTitle = 'Reddit';
      else if (domain.includes('britannica')) cleanTitle = 'Britannica';
      else cleanTitle = domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.navigate(activeTabId, formattedUrl);
    }

    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === state.activeTabId
          ? {
              ...tab,
              url: formattedUrl,
              title: cleanTitle,
              favicon,
              canGoBack: true,
            }
          : tab
      ),
    }));
  },

  goBack: () => {
    const { tabs, activeTabId, goHome } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);

    if (typeof window !== 'undefined' && window.electronAPI && activeTab?.canGoBack) {
      window.electronAPI.goBack(activeTabId);
    } else {
      goHome();
    }
  },

  goForward: () => {
    const { tabs, activeTabId } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);

    if (typeof window !== 'undefined' && window.electronAPI && activeTab?.canGoForward) {
      window.electronAPI.goForward(activeTabId);
    }
  },

  reload: () => {
    const { tabs, activeTabId, updateTab } = get();
    const activeTab = tabs.find((t) => t.id === activeTabId);

    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.reload(activeTabId);
    } else if (activeTab?.url) {
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
