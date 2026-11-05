import electron from 'electron';
import type { BrowserWindow as BrowserWindowType, BrowserView as BrowserViewType } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const app = typeof electron === 'object' ? electron.app : undefined;
const BrowserWindow = typeof electron === 'object' ? electron.BrowserWindow : undefined;
const BrowserView = typeof electron === 'object' ? electron.BrowserView : undefined;
const ipcMain = typeof electron === 'object' ? electron.ipcMain : undefined;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app?.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let mainWindow: BrowserWindowType | null = null;
const tabViews = new Map<string, BrowserViewType>();
let activeTabId: string | null = null;
let currentBounds = { x: 62, y: 78, width: 1200, height: 750 };
let isWebviewVisible = false;

function createTabView(tabId: string): BrowserViewType {
  if (!BrowserView) throw new Error('BrowserView is not supported');
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const sendNavState = () => {
    if (!mainWindow) return;
    const wc = view.webContents;
    mainWindow.webContents.send('browser:nav-state-changed', {
      tabId,
      url: wc.getURL(),
      title: wc.getTitle(),
      canGoBack: wc.canGoBack(),
      canGoForward: wc.canGoForward(),
      isLoading: wc.isLoading(),
    });
  };

  view.webContents.on('did-navigate', sendNavState);
  view.webContents.on('did-navigate-in-page', sendNavState);
  view.webContents.on('did-start-loading', sendNavState);
  view.webContents.on('did-stop-loading', sendNavState);
  view.webContents.on('page-title-updated', sendNavState);

  // Send real favicon whenever page updates its favicon
  view.webContents.on('page-favicon-updated', (_event, favicons) => {
    if (favicons && favicons.length > 0 && mainWindow) {
      const wc = view.webContents;
      mainWindow.webContents.send('browser:nav-state-changed', {
        tabId,
        url: wc.getURL(),
        title: wc.getTitle(),
        canGoBack: wc.canGoBack(),
        canGoForward: wc.canGoForward(),
        isLoading: wc.isLoading(),
        favicon: favicons[0],
      });
    }
  });

  // Handle target="_blank" and window.open links by requesting React to open a new tab
  view.webContents.setWindowOpenHandler(({ url }) => {
    if (mainWindow) {
      mainWindow.webContents.send('browser:open-new-tab', url);
    }
    return { action: 'deny' };
  });

  tabViews.set(tabId, view);
  return view;
}

function getOrCreateTabView(tabId: string): BrowserViewType {
  let view = tabViews.get(tabId);
  if (!view) {
    view = createTabView(tabId);
  }
  return view;
}

function attachActiveTabView(tabId: string) {
  if (!mainWindow) return;

  activeTabId = tabId;
  const view = tabViews.get(tabId);

  if (view) {
    mainWindow.setBrowserView(view);
    view.setBounds(currentBounds);
    isWebviewVisible = true;
  } else {
    mainWindow.setBrowserView(null);
    isWebviewVisible = false;
  }
}

function createWindow() {
  if (!BrowserWindow || !BrowserView) return;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#262626',
    title: 'Carule Agentic Browser',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#262626',
      symbolColor: '#e4e4e7',
      height: 38,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove default File, Edit, View, Window native menu bar to eliminate wasted vertical space
  mainWindow.removeMenu();

  // Load the React Vite frontend
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (process.env.DIST) {
    mainWindow.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    for (const view of tabViews.values()) {
      try {
        (view.webContents as any).close?.();
      } catch {
        // ignore
      }
    }
    tabViews.clear();
  });
}

// IPC Handlers
if (app && ipcMain && BrowserWindow && BrowserView) {
  ipcMain.on('browser:navigate', (_event, payload: any, fallbackUrl?: string) => {
    let tabId = typeof payload === 'object' && payload?.tabId ? payload.tabId : typeof payload === 'string' && fallbackUrl ? payload : activeTabId || 'tab-default';
    let rawUrl = typeof payload === 'object' && payload?.url ? payload.url : typeof fallbackUrl === 'string' ? fallbackUrl : typeof payload === 'string' ? payload : '';

    if (!rawUrl || !rawUrl.trim()) return;

    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = `https://${url}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    const view = getOrCreateTabView(tabId);
    attachActiveTabView(tabId);
    view.webContents.loadURL(url);
  });

  ipcMain.on('browser:switch-tab', (_event, tabId: string) => {
    if (!mainWindow) return;
    activeTabId = tabId;
    const view = tabViews.get(tabId);
    if (view) {
      mainWindow.setBrowserView(view);
      view.setBounds(currentBounds);
      isWebviewVisible = true;
    } else {
      mainWindow.setBrowserView(null);
      isWebviewVisible = false;
    }
  });

  ipcMain.on('browser:close-tab', (_event, tabId: string) => {
    const view = tabViews.get(tabId);
    if (view) {
      if (activeTabId === tabId && mainWindow) {
        mainWindow.setBrowserView(null);
        isWebviewVisible = false;
      }
      try {
        (view.webContents as any).close?.();
      } catch {
        // ignore
      }
      tabViews.delete(tabId);
    }
  });

  ipcMain.on('browser:update-bounds', (_event, bounds) => {
    currentBounds = bounds;
    if (activeTabId && mainWindow && isWebviewVisible) {
      const view = tabViews.get(activeTabId);
      if (view) {
        view.setBounds(bounds);
      }
    }
  });

  ipcMain.on('browser:hide-webview', () => {
    if (mainWindow) {
      mainWindow.setBrowserView(null);
      isWebviewVisible = false;
    }
  });

  ipcMain.on('browser:show-webview', (_event, tabId?: string) => {
    const targetId = tabId || activeTabId;
    if (targetId && mainWindow) {
      attachActiveTabView(targetId);
    }
  });

  ipcMain.on('browser:go-back', (_event, tabId?: string) => {
    const targetId = tabId || activeTabId;
    if (targetId) {
      const view = tabViews.get(targetId);
      if (view?.webContents.canGoBack()) {
        view.webContents.goBack();
      }
    }
  });

  ipcMain.on('browser:go-forward', (_event, tabId?: string) => {
    const targetId = tabId || activeTabId;
    if (targetId) {
      const view = tabViews.get(targetId);
      if (view?.webContents.canGoForward()) {
        view.webContents.goForward();
      }
    }
  });

  ipcMain.on('browser:reload', (_event, tabId?: string) => {
    const targetId = tabId || activeTabId;
    if (targetId) {
      const view = tabViews.get(targetId);
      view?.webContents.reload();
    }
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}
