import React, { useEffect, useRef } from 'react';
import type { BrowserViewportProps } from '../../types';
import { DynamicIsland } from './DynamicIsland';
import { TopNavBar } from './TopNavBar';
import { ZenCenter } from './ZenCenter';
import { SearchResultsView } from './SearchResultsView';
import { WebCanvas } from './WebCanvas';
import { MultiBrowserPage } from '../pages/MultiBrowserPage';
import { AIChatPage } from '../pages/AIChatPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AnimatePresence } from 'framer-motion';
import { AIChatSidebar } from './AIChatSidebar';
import { useBrowserStore } from '../../store/useBrowserStore';
import { isSearchQueryUrl } from '../../services/searchEngine';
import './BrowserViewport.css';

export const BrowserViewport: React.FC<BrowserViewportProps> = ({
  className = '',
  children,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const { tabs, activeTabId, updateTab, openTab, activePage, isAIChatSidebarOpen } = useBrowserStore();
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
      if (state.tabId && state.url) {
        updateTab(state.tabId, {
          url: state.url,
          title: state.title || state.url,
          canGoBack: state.canGoBack,
          canGoForward: state.canGoForward,
          isLoading: state.isLoading,
          favicon: state.favicon,
        });
      }
    });

    const unsubscribeOpen = window.electronAPI.onOpenNewTab?.((url) => {
      openTab(url);
    });

    return () => {
      window.removeEventListener('resize', syncBounds);
      if (resizeObserver) resizeObserver.disconnect();
      unsubscribe();
      if (unsubscribeOpen) unsubscribeOpen();
    };
  }, [isElectron, updateTab, openTab]);

  // Handle showing/hiding native Chromium webview based on activePage and url
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    if (activePage === 'single-browser' && activeTab?.url) {
      window.electronAPI.showWebview(activeTabId);
    } else {
      window.electronAPI.hideWebview();
    }
  }, [isElectron, activePage, activeTabId, activeTab?.url]);

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
        if (isElectron) {
          // Native Chromium BrowserView renders the real page in this viewport
          return null;
        }
        // In web preview mode outside Electron:
        if (isSearchQueryUrl(activeTab.url)) {
          return <SearchResultsView url={activeTab.url} />;
        }
        return <WebCanvas url={activeTab.url} />;
    }
  };

  return (
    <section
      className={`browser-frame ${isAIChatSidebarOpen ? 'has-chat-open' : ''} ${className}`.trim()}
      aria-label="Browser Viewport Frame"
    >
      {/* Dynamic Island: Attached directly to the dark top frame, seamlessly covering any border */}
      <DynamicIsland />

      <div className="browser-canvas">
        {/* Top Chrome Zone: Navigation Pods & Search Bar */}
        <div className="browser-top-zone">
          <TopNavBar />
        </div>

        {/* Web Content Stage: Native Chromium webview attaches ONLY here */}
        <div ref={stageRef} className="browser-web-stage">
          {renderActiveCanvas()}
        </div>
      </div>

      {/* Sliding Right-side Agentic Chat Sidebar */}
      <AnimatePresence>
        {isAIChatSidebarOpen && <AIChatSidebar />}
      </AnimatePresence>
    </section>
  );
};

export default BrowserViewport;
