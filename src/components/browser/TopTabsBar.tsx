import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Moon,
  Zap,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import type { Tab } from '../../types';
import './TopTabsBar.css';

export const TopTabsBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    openTab,
    toggleHibernateTab,
  } = useBrowserStore();

  const [popoverTabId, setPopoverTabId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverTabId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleWakeUp = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggleHibernateTab) {
      toggleHibernateTab(tabId);
    }
    setPopoverTabId(null);
  };

  const getTabIcon = (tab: Tab) => {
    if (!tab.url) {
      return <div className="railway-badge-squircle" />;
    }
    const url = tab.url.toLowerCase();
    if (url.includes('youtube')) {
      return (
        <div className="railway-badge-squircle" style={{ backgroundColor: '#ff0000' }}>
          <svg viewBox="0 0 24 24" width="8" height="8" fill="#ffffff">
            <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
          </svg>
        </div>
      );
    }
    if (url.includes('github')) {
      return (
        <div className="railway-badge-squircle" style={{ backgroundColor: '#18181b' }}>
          <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="#ffffff" strokeWidth="2.4">
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
          </svg>
        </div>
      );
    }
    if (url.includes('wikipedia')) {
      return (
        <div className="railway-badge-squircle" style={{ backgroundColor: '#2b2b2b' }}>
          <span style={{ fontSize: '8px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>W</span>
        </div>
      );
    }
    if (url.includes('google')) {
      return (
        <div className="railway-badge-squircle" style={{ backgroundColor: '#4285f4' }}>
          <span style={{ fontSize: '8px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>G</span>
        </div>
      );
    }
    if (url.includes('reddit')) {
      return (
        <div className="railway-badge-squircle" style={{ backgroundColor: '#ff4500' }}>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />
        </div>
      );
    }
    return <div className="railway-badge-squircle" />;
  };

  const getCleanTitle = (tab: Tab) => {
    if (!tab.url) return tab.title || 'New Tab';
    try {
      const parsed = new URL(tab.url);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host.includes('google')) return 'Google';
      if (host.includes('youtube')) return 'YouTube';
      if (host.includes('github')) return 'GitHub';
      if (host.includes('wikipedia')) return 'Wikipedia';
      if (host.includes('reddit')) return 'Reddit';
      if (host.includes('chatgpt')) return 'ChatGPT';
      if (host.includes('x.com') || host.includes('twitter')) return 'X / Twitter';
      return host;
    } catch {
      return tab.title || 'New Tab';
    }
  };
    if (!tab.url) return tab.title || 'New Tab';
    try {
      const parsed = new URL(tab.url);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host.includes('google')) return 'Google';
      if (host.includes('youtube')) return 'YouTube';
      if (host.includes('github')) return 'GitHub';
      if (host.includes('wikipedia')) return 'Wikipedia';
      if (host.includes('reddit')) return 'Reddit';
      if (host.includes('chatgpt')) return 'ChatGPT';
      if (host.includes('x.com') || host.includes('twitter')) return 'X / Twitter';
      return host;
    } catch {
      return tab.title || 'New Tab';
    }
  };

  return (
    <div className="top-tabs-container" role="tablist" aria-label="Open tabs">
      <div className="top-tabs-strip">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isHibernated = Boolean(tab.isHibernated);
          const title = getCleanTitle(tab);
          const isPopoverOpen = popoverTabId === tab.id;

          if (isActive) {
            return (
              <div
                key={tab.id}
                className="railway-active-notch-tab"
                role="tab"
                aria-selected="true"
                tabIndex={0}
                onClick={() => setActiveTab(tab.id)}
              >
                {/* Left Curved S-Wing: Soft, Wide, Gentle Fillet */}
                <svg
                  viewBox="0 0 34 38"
                  className="railway-wing-svg railway-wing-left"
                  aria-hidden="true"
                >
                  <path
                    d="M 0,0 C 14,0 18,12 21,22 C 24,31 27,38 34,38 L 34,0 Z"
                    className="railway-notch-fill"
                  />
                  <path
                    d="M 0,0 C 14,0 18,12 21,22 C 24,31 27,38 34,38"
                    className="railway-notch-stroke"
                  />
                </svg>

                {/* Central Body of the Notch: Connected directly to top edge */}
                <div className="railway-notch-body">
                  {/* Status / Hibernation Glow Icon Badge */}
                  <button
                    type="button"
                    className={`railway-status-badge ${isHibernated ? 'is-hibernating' : 'is-active'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopoverTabId(isPopoverOpen ? null : tab.id);
                    }}
                    title={isHibernated ? 'Environment hibernating (click for details)' : 'Tab active & responsive'}
                    aria-label="Tab Status"
                  >
                    {isHibernated ? (
                      <span className="railway-hibernation-glyph" aria-hidden="true">
                        <Moon size={11} strokeWidth={2.4} />
                        <span className="railway-z-glyph">z</span>
                      </span>
                    ) : (
                      <span className="railway-active-glyph" aria-hidden="true">
                        <Zap size={11} strokeWidth={2.4} />
                      </span>
                    )}
                  </button>

                  {/* Tab Title */}
                  <span className="railway-notch-title" title={tab.title || tab.url || 'New Tab'}>
                    {isHibernated ? 'Environment hibernating' : title}
                  </span>

                  {/* Close Tab Button */}
                  {tabs.length > 1 && (
                    <button
                      type="button"
                      className="railway-notch-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      title="Close Tab"
                      aria-label="Close Tab"
                    >
                      <X size={12} strokeWidth={2.4} />
                    </button>
                  )}
                </div>

                {/* Right Curved S-Wing: Soft, Wide, Gentle Fillet */}
                <svg
                  viewBox="0 0 34 38"
                  className="railway-wing-svg railway-wing-right"
                  aria-hidden="true"
                >
                  <path
                    d="M 0,38 C 7,38 10,31 13,22 C 16,12 20,0 34,0 L 0,0 Z"
                    className="railway-notch-fill"
                  />
                  <path
                    d="M 0,38 C 7,38 10,31 13,22 C 16,12 20,0 34,0"
                    className="railway-notch-stroke"
                  />
                </svg>

                {/* Floating Popover Card: Exactly as shown in the screenshot */}
                {isPopoverOpen && (
                  <div
                    ref={popoverRef}
                    className="railway-status-popover"
                    role="tooltip"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="railway-popover-text">
                      {isHibernated ? (
                        <>
                          Your environment has been
                          <br />
                          scaled to zero for <strong>{tab.hibernatedDuration || '26hrs 32mins'}</strong>.
                        </>
                      ) : (
                        <>
                          Your environment is active
                          <br />
                          and running smoothly with low latency.
                        </>
                      )}
                    </p>

                    <div className="railway-popover-actions">
                      <button
                        type="button"
                        className="railway-wake-link"
                        onClick={(e) => handleWakeUp(tab.id, e)}
                      >
                        {isHibernated ? 'Wake up' : 'Hibernate to save costs'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Inactive Tab (Matching "production" breadcrumb pill in reference image)
          return (
            <div
              key={tab.id}
              className="railway-inactive-tab"
              role="tab"
              aria-selected="false"
              onClick={() => setActiveTab(tab.id)}
            >
              {/* Left Breadcrumb chevron / slash */}
              <span className="railway-crumb-chevron" aria-hidden="true">
                <ChevronDown size={10} strokeWidth={2.4} />
              </span>
              <span className="railway-crumb-slash" aria-hidden="true">/</span>

              {/* Blue/indigo rounded square badge matching image */}
              <div className="railway-inactive-badge" aria-hidden="true">
                <div className="railway-badge-squircle" />
              </div>

              {/* High-Contrast Visible Tab Title */}
              <span className="railway-inactive-title">{title}</span>

              {/* Right chevron */}
              <span className="railway-crumb-chevron" aria-hidden="true">
                <ChevronDown size={10} strokeWidth={2.4} />
              </span>

              {tabs.length > 1 && (
                <button
                  type="button"
                  className="railway-inactive-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  title="Close Tab"
                  aria-label="Close Tab"
                >
                  <X size={11} strokeWidth={2.2} />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab Button (+) */}
        <button
          type="button"
          className="railway-add-tab-btn"
          onClick={() => openTab('', 'New Tab')}
          title="Open New Tab"
          aria-label="New Tab"
        >
          <Plus size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
};

export default TopTabsBar;
