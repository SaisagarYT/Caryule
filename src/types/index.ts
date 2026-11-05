export type ActivePage = 'single-browser' | 'multi-browser' | 'ai-chat' | 'profile';

export interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
  canGoBack?: boolean;
  canGoForward?: boolean;
  isAgentActive?: boolean;
  isHibernated?: boolean;
  hibernatedDuration?: string;
}

export type IslandStatus = 'idle' | 'thinking' | 'acting' | 'navigating' | 'completed' | 'error';

export interface DynamicIslandState {
  status: IslandStatus;
  message: string;
  details?: string;
  isExpanded: boolean;
}

export type AgentModel = 'fast' | 'in-depth' | 'magic' | 'holistic';

export interface BrowserStoreState {
  // Navigation Pages
  activePage: ActivePage;

  // Tabs
  tabs: Tab[];
  activeTabId: string;

  // Dynamic Island
  island: DynamicIslandState;

  // Omnibar
  isOmnibarOpen: boolean;
  omnibarQuery: string;

  // Sidebar
  isSidebarCollapsed: boolean;

  // Agent Settings
  selectedModel: AgentModel;

  // Actions
  setActivePage: (page: ActivePage) => void;
  openTab: (url?: string, title?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleHibernateTab?: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  navigateActiveTab: (url: string) => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  goHome: () => void;
  setIslandState: (updates: Partial<DynamicIslandState>) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedModel: (model: AgentModel) => void;
  toggleOmnibar: (open?: boolean) => void;
  setOmnibarQuery: (query: string) => void;
}

export interface DynamicIslandProps {
  className?: string;
}

export interface SidebarProps {
  className?: string;
}

export interface BrowserViewportProps {
  className?: string;
  children?: React.ReactNode;
}

// Google-level Search Types
export type SearchFilterTab = 'all' | 'images' | 'videos' | 'news' | 'maps' | 'shopping';

export interface WebSearchResult {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  date?: string;
  sitelinks?: { title: string; url: string }[];
}

export interface ImageSearchResult {
  id: string;
  title: string;
  imageUrl: string;
  sourceUrl: string;
  domain: string;
  dimensions?: string;
}

export interface VideoSearchResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  duration: string;
  views: string;
  uploadedAt: string;
  snippet?: string;
}

export interface NewsSearchResult {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceLogo?: string;
  timeAgo: string;
  snippet: string;
  imageUrl?: string;
}

export interface SearchData {
  query: string;
  stats: string;
  aiOverview?: {
    summary: string;
    keyPoints: string[];
    sources: { name: string; url: string }[];
  };
  knowledgeCard?: {
    title: string;
    subtitle: string;
    description: string;
    image?: string;
    attributes: { label: string; value: string }[];
  };
  results: WebSearchResult[];
  images: ImageSearchResult[];
  videos: VideoSearchResult[];
  news: NewsSearchResult[];
  peopleAlsoAsk: { question: string; answer: string }[];
  relatedSearches: string[];
}
