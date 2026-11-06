export interface ViewBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NavigationState {
  tabId: string;
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  favicon?: string;
}

export interface ElectronAPI {
  navigate: (tabId: string, url: string) => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  updateBounds: (bounds: ViewBounds) => void;
  hideWebview: () => void;
  showWebview: (tabId?: string) => void;
  goBack: (tabId?: string) => void;
  goForward: (tabId?: string) => void;
  reload: (tabId?: string) => void;
  onNavigationState: (callback: (state: NavigationState) => void) => () => void;
  onOpenNewTab?: (callback: (url: string) => void) => () => void;
  minimizeWindow?: () => void;
  maximizeWindow?: () => void;
  closeWindow?: () => void;
  isMaximized?: () => Promise<boolean>;
  onMaximizeChange?: (callback: (isMax: boolean) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
