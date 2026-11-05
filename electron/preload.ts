import { contextBridge, ipcRenderer } from 'electron';

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

contextBridge.exposeInMainWorld('electronAPI', {
  navigate: (url: string) => ipcRenderer.send('browser:navigate', url),
  updateBounds: (bounds: ViewBounds) => ipcRenderer.send('browser:update-bounds', bounds),
  hideWebview: () => ipcRenderer.send('browser:hide-webview'),
  showWebview: () => ipcRenderer.send('browser:show-webview'),
  goBack: () => ipcRenderer.send('browser:go-back'),
  goForward: () => ipcRenderer.send('browser:go-forward'),
  reload: () => ipcRenderer.send('browser:reload'),
  onNavigationState: (callback: (state: NavigationState) => void) => {
    const subscription = (_event: unknown, state: NavigationState) => callback(state);
    ipcRenderer.on('browser:nav-state-changed', subscription);
    return () => {
      ipcRenderer.removeListener('browser:nav-state-changed', subscription);
    };
  },
});
