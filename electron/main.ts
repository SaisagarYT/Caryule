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
let browserView: BrowserViewType | null = null;
let currentBounds = { x: 62, y: 58, width: 1200, height: 750 };
let isWebviewVisible = false;

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

  // Create the underlying real Chromium engine view
  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Track navigation changes and notify UI
  browserView.webContents.on('did-navigate', () => sendNavState());
  browserView.webContents.on('did-navigate-in-page', () => sendNavState());
  browserView.webContents.on('did-start-loading', () => sendNavState());
  browserView.webContents.on('did-stop-loading', () => sendNavState());
  browserView.webContents.on('page-title-updated', () => sendNavState());

  function sendNavState() {
    if (!mainWindow || !browserView) return;
    const wc = browserView.webContents;
    mainWindow.webContents.send('browser:nav-state-changed', {
      url: wc.getURL(),
      title: wc.getTitle(),
      canGoBack: wc.canGoBack(),
      canGoForward: wc.canGoForward(),
      isLoading: wc.isLoading(),
    });
  }

  // Load the React Vite frontend
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (process.env.DIST) {
    mainWindow.loadFile(path.join(process.env.DIST, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    browserView = null;
  });
}

// IPC Handlers
if (app && ipcMain && BrowserWindow && BrowserView) {
  ipcMain.on('browser:navigate', (_event, rawUrl: string) => {
    if (!browserView || !mainWindow) return;

    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.') && !url.includes(' ')) {
        url = `https://${url}`;
      } else {
        url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      }
    }

    // Show webview and load URL
    if (!isWebviewVisible) {
      mainWindow.setBrowserView(browserView);
      isWebviewVisible = true;
    }
    browserView.setBounds(currentBounds);
    browserView.webContents.loadURL(url);
  });

  ipcMain.on('browser:update-bounds', (_event, bounds) => {
    currentBounds = bounds;
    if (browserView && isWebviewVisible) {
      browserView.setBounds(bounds);
    }
  });

  ipcMain.on('browser:hide-webview', () => {
    if (mainWindow && browserView && isWebviewVisible) {
      mainWindow.setBrowserView(null);
      isWebviewVisible = false;
    }
  });

  ipcMain.on('browser:show-webview', () => {
    if (mainWindow && browserView && !isWebviewVisible) {
      mainWindow.setBrowserView(browserView);
      browserView.setBounds(currentBounds);
      isWebviewVisible = true;
    }
  });

  ipcMain.on('browser:go-back', () => {
    if (browserView?.webContents.canGoBack()) {
      browserView.webContents.goBack();
    }
  });

  ipcMain.on('browser:go-forward', () => {
    if (browserView?.webContents.canGoForward()) {
      browserView.webContents.goForward();
    }
  });

  ipcMain.on('browser:reload', () => {
    browserView?.webContents.reload();
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
