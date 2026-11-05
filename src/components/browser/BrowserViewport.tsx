import React, { useEffect, useRef } from 'react';
import type { BrowserViewportProps } from '../../types';
import { DynamicIsland } from './DynamicIsland';
import { TopNavBar } from './TopNavBar';
import { ZenCenter } from './ZenCenter';
import { SearchResultsView } from './SearchResultsView';
import { WebCanvas } from './WebCanvas';
import { WallpaperCustomizer } from './WallpaperCustomizer';
import { MultiBrowserPage } from '../pages/MultiBrowserPage';
import { AIChatPage } from '../pages/AIChatPage';
import { ProfilePage } from '../pages/ProfilePage';
import { useBrowserStore } from '../../store/useBrowserStore';
import { useWallpaperStore } from '../../store/useWallpaperStore';
import { isSearchQueryUrl } from '../../services/searchEngine';
import './BrowserViewport.css';

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  className = '',
  children,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const { tabs, activeTabId, updateTab, activePage } = useBrowserStore();
  const { type: wallpaperType, value: wallpaperValue, blur, opacity, isDark } = useWallpaperStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI);

  // Sync stage dimensions with Electron WebContentsView / BrowserView
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    const syncBounds = () => {
      if (!stageRef.current || !window.electronAPI) return;
      const rect = stageRef.current.getBoundingClientRect();
      window.electronAPI.updateBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    syncBounds();
    window.addEventListener('resize', syncBounds);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      resizeObserver = new ResizeObserver(() => syncBounds());
      resizeObserver.observe(stageRef.current);
    }

    const unsubscribe = window.electronAPI.onNavigationState((state) => {
      if (state.url) {
        updateTab(activeTabId, {
          url: state.url,
          title: state.title || state.url,
          canGoBack: state.canGoBack,
          canGoForward: state.canGoForward,
          isLoading: state.isLoading,
        });
      }
    });

    return () => {
      window.removeEventListener('resize', syncBounds);
      if (resizeObserver) resizeObserver.disconnect();
      unsubscribe();
    };
  }, [isElectron, activeTabId, updateTab]);

  // Handle showing/hiding native Chromium webview based on activePage and url
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    if (
      activePage === 'single-browser' &&
      activeTab &&
      activeTab.url &&
      !isSearchQueryUrl(activeTab.url)
    ) {
      window.electronAPI.showWebview();
    } else {
      window.electronAPI.hideWebview();
    }
  }, [isElectron, activePage, activeTab?.url]);

  const renderActiveCanvas = () => {
    if (children) return children;

    switch (activePage) {
      case 'multi-browser':
        return <MultiBrowserPage />;
      case 'ai-chat':
        return <AIChatPage />;
      case 'profile':
        return <ProfilePage />;
      case 'single-browser':
      default:
        if (!activeTab?.url) {
          return <ZenCenter />;
        }
        if (isSearchQueryUrl(activeTab.url)) {
          return <SearchResultsView url={activeTab.url} />;
        }
        return !isElectron ? (
          <WebCanvas url={activeTab.url} />
        ) : null;
    }
  };

  return (
    <section
      className={`browser-frame ${className}`.trim()}
      aria-label="Browser Viewport Frame"
    >
      {/* Dynamic Island: Attached directly to the dark top frame, seamlessly covering any border */}
      <DynamicIsland />

      <div className={`browser-canvas ${isDark ? 'is-dark-canvas' : ''}`}>
        {/* Wallpaper Layer */}
        <div
          className="browser-canvas-wallpaper"
          style={{
            background: wallpaperType !== 'image' ? wallpaperValue : undefined,
            backgroundImage: wallpaperType === 'image' ? `url(${wallpaperValue})` : undefined,
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
            opacity: opacity,
          }}
        />

        {/* Top Chrome Zone: Navigation Pods & Search Bar (Dynamic Island hangs through the center cutout) */}
        <div className="browser-top-zone">
          <TopNavBar />
        </div>

        {/* Web Content Stage: Native Chromium webview attaches ONLY here */}
        <div ref={stageRef} className="browser-web-stage">
          {renderActiveCanvas()}
        </div>

        {/* Floating Wallpaper Customizer Widget (Bottom Right) */}
        <WallpaperCustomizer />
      </div>
    </section>
  );
};

export default BrowserViewport;
