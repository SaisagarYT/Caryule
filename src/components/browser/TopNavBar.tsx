import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Home,
  Plus,
  Search,
  Lock,
} from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import { isSearchQueryUrl, extractSearchQuery } from '../../services/searchEngine';
import { TopTabsBar } from './TopTabsBar';
import './TopNavBar.css';

export const TopNavBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    goBack,
    goForward,
    reload,
    goHome,
    openTab,
    navigateActiveTab,
  } = useBrowserStore();

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const canGoBack = Boolean(activeTab?.canGoBack || activeTab?.url);
  const canGoForward = Boolean(activeTab?.canGoForward);
  const isLoading = Boolean(activeTab?.isLoading);

  // Address bar input state
  const [urlInput, setUrlInput] = useState(activeTab?.url || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input with active tab URL when not actively editing
  useEffect(() => {
    if (!isFocused) {
      if (activeTab?.url && isSearchQueryUrl(activeTab.url)) {
        setUrlInput(extractSearchQuery(activeTab.url));
      } else {
        setUrlInput(activeTab?.url || '');
      }
    }
  }, [activeTab?.url, isFocused]);

  // Keyboard navigation shortcuts: Alt+Left, Alt+Right, Ctrl+R, Ctrl+L
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key === 'ArrowLeft') || (e.metaKey && e.key === '[')) {
        e.preventDefault();
        goBack();
      } else if ((e.altKey && e.key === 'ArrowRight') || (e.metaKey && e.key === ']')) {
        e.preventDefault();
        goForward();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        reload();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, reload]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    navigateActiveTab(urlInput);
    inputRef.current?.blur();
  };

  const isSecure = activeTab?.url?.startsWith('https://');

  return (
    <header className="top-nav-bar" aria-label="Browser Top Navigation">
      {/* Row 1: Top Tabs Strip (At the very top, exactly like Google Chrome) */}
      <div className="top-tabs-row">
        <TopTabsBar />
        <div className="top-window-drag-region" />
      </div>

      {/* Row 2: Navigation & Search Toolbar */}
      <div className="top-toolbar-row">
        {/* Navigation Buttons Capsule Pod (< > ⟳) */}
        <div className="nav-capsule-pod" aria-label="History Navigation">
          <button
            type="button"
            className="nav-tool-btn"
            onClick={goBack}
            disabled={!canGoBack}
            title={canGoBack ? 'Go back (Alt+Left)' : 'Cannot go back'}
            aria-label="Back"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            className="nav-tool-btn"
            onClick={goForward}
            disabled={!canGoForward}
            title={canGoForward ? 'Go forward (Alt+Right)' : 'Cannot go forward'}
            aria-label="Forward"
          >
            <ChevronRight size={16} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            className="nav-tool-btn"
            onClick={reload}
            disabled={!activeTab?.url}
            title="Reload page (Ctrl+R)"
            aria-label="Reload"
          >
            <RotateCw
              size={13}
              strokeWidth={2.2}
              className={isLoading ? 'animate-spin text-white' : ''}
            />
          </button>
        </div>

        {/* Google-style Search & Address Bar */}
        <form onSubmit={handleSubmit} className="top-search-bar">
          {isSecure ? (
            <Lock size={13} strokeWidth={2.2} className="top-search-icon text-emerald-400" />
          ) : (
            <Search size={14} strokeWidth={2.2} className="top-search-icon" />
          )}

          <input
            ref={inputRef}
            type="text"
            className="top-search-input"
            placeholder="Search Google or type a URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              inputRef.current?.select();
            }}
            onBlur={() => setIsFocused(false)}
          />

          {!isFocused && !urlInput && (
            <span className="top-search-badge" title="Press Ctrl+L to focus">
              ⌘L
            </span>
          )}
        </form>

        {/* Right Action Capsule Pod: Home */}
        <div className="nav-capsule-pod" aria-label="Page Actions">
          <button
            type="button"
            className="nav-tool-btn"
            onClick={goHome}
            title="Zen Home"
            aria-label="Home"
          >
            <Home size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
