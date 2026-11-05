export interface ViewBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NavigationState {
  url: string;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
}

export interface ElectronAPI {
  navigate: (url: string) => void;
  updateBounds: (bounds: ViewBounds) => void;
  hideWebview: () => void;
  showWebview: () => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  onNavigationState: (callback: (state: NavigationState) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

