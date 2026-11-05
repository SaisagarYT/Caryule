import { contextBridge, ipcRenderer } from 'electron';

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

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (tabId: string, url: string) => ipcRenderer.send('browser:navigate', { tabId, url }),
  switchTab: (tabId: string) => ipcRenderer.send('browser:switch-tab', tabId),
  closeTab: (tabId: string) => ipcRenderer.send('browser:close-tab', tabId),
  updateBounds: (bounds: ViewBounds) => ipcRenderer.send('browser:update-bounds', bounds),
  hideWebview: () => ipcRenderer.send('browser:hide-webview'),
  showWebview: (tabId?: string) => ipcRenderer.send('browser:show-webview', tabId),
  goBack: (tabId?: string) => ipcRenderer.send('browser:go-back', tabId),
  goForward: (tabId?: string) => ipcRenderer.send('browser:go-forward', tabId),
  reload: (tabId?: string) => ipcRenderer.send('browser:reload', tabId),
  onNavigationState: (callback: (state: NavigationState) => void) => {
    const subscription = (_event: unknown, state: NavigationState) => callback(state);
    ipcRenderer.on('browser:nav-state-changed', subscription);
    return () => {
      ipcRenderer.removeListener('browser:nav-state-changed', subscription);
    };
  },
  onOpenNewTab: (callback: (url: string) => void) => {
    const subscription = (_event: unknown, url: string) => callback(url);
    ipcRenderer.on('browser:open-new-tab', subscription);
    return () => {
      ipcRenderer.removeListener('browser:open-new-tab', subscription);
    };
  },
});
