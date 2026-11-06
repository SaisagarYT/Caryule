import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Clock,
  Globe,
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

  const getTabFaviconUrl = (tab: Tab): string | null => {
    if (tab.favicon) return tab.favicon;
    if (!tab.url) return null;
    try {
      const parsed = new URL(tab.url);
      const host = parsed.hostname.replace(/^www\./, '');
      if (host) {
        return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
      }
    } catch {
      // not a full url
    }
    return null;
  };

  const renderTabFavicon = (tab: Tab) => {
    const faviconUrl = getTabFaviconUrl(tab);
    if (!faviconUrl) {
      return (
        <div className="tab-favicon-container">
          <div className="tab-newtab-dot" />
        </div>
      );
    }
    return (
      <div className="tab-favicon-container">
        <img
          src={faviconUrl}
          alt=""
          className="tab-favicon-img"
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.tab-favicon-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="tab-favicon-fallback" style={{ display: 'none' }}>
          <Globe size={13} className="text-zinc-400" />
        </div>
      </div>
    );
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

  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Native non-passive horizontal mouse wheel listener
  useEffect(() => {
    const container = containerRef.current;
    const strip = stripRef.current;
    if (!container || !strip) return;

    const onWheel = (e: WheelEvent) => {
      if (strip.scrollWidth > strip.clientWidth) {
        e.preventDefault();
        e.stopPropagation();
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        strip.scrollLeft += delta;
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Automatically scroll active or new tab into view
  useEffect(() => {
    if (stripRef.current) {
      const activeEl = stripRef.current.querySelector('.railway-active-notch-tab');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeTabId, tabs.length]);

  // Double clicking on empty tab bar space opens a new tab
  const handleContainerDoubleClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains('top-tabs-strip') ||
      (e.target as HTMLElement).classList.contains('top-tabs-container')
    ) {
      openTab('', 'New Tab');
    }
  };

  return (
    <div
      ref={containerRef}
      className="top-tabs-container"
      role="tablist"
      aria-label="Open tabs"
      onDoubleClick={handleContainerDoubleClick}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="top-tabs-island"
      >
        <div
          ref={stripRef}
          className="top-tabs-strip"
        >
          <AnimatePresence initial={false}>
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeTabId;
              const isHibernated = Boolean(tab.isHibernated);
              const title = getCleanTitle(tab);
              const isPopoverOpen = popoverTabId === tab.id;

              if (isActive) {
                return (
                  <motion.div
                    layout
                    key={tab.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.2 }}
                    className="railway-active-notch-tab"
                    role="tab"
                    aria-selected="true"
                    tabIndex={0}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {/* Left Curved Notch Wing: Flared at top ceiling, curves into rounded bottom */}
                    <svg
                      viewBox="0 0 16 38"
                      className="railway-wing-svg railway-wing-left"
                      aria-hidden="true"
                    >
                      <path
                        d="M 0,0 C 4,12 10,38 16,38 L 16,0 Z"
                        className="railway-notch-fill"
                      />
                    </svg>

                    {/* Central Body of the Notch (White color) */}
                    <div className="railway-notch-body">
                      {isHibernated ? (
                        <button
                          type="button"
                          className="railway-hibernation-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopoverTabId(isPopoverOpen ? null : tab.id);
                          }}
                          title="Environment hibernating (click for details)"
                          aria-label="Tab Status"
                        >
                          <Clock size={9} strokeWidth={2.4} className="railway-clock-icon" />
                          <span className="railway-z-glyph">z</span>
                        </button>
                      ) : (
                        <div
                          className="railway-active-favicon-badge"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopoverTabId(isPopoverOpen ? null : tab.id);
                          }}
                          title="Click to view tab status"
                        >
                          {renderTabFavicon(tab)}
                        </div>
                      )}

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

                    {/* Right Curved Notch Wing: Flared at top ceiling, curves into rounded bottom */}
                    <svg
                      viewBox="0 0 16 38"
                      className="railway-wing-svg railway-wing-right"
                      aria-hidden="true"
                    >
                      <path
                        d="M 0,38 C 6,38 12,12 16,0 L 0,0 Z"
                        className="railway-notch-fill"
                      />
                    </svg>

                    {/* Floating Popover Card */}
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
                            {isHibernated ? 'Wake up' : 'Hibernate to save memory'}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              }

              // Inactive Tab: Aerodynamic Parallelogram (Mirrored \ on left, Forward / on right)
              const isLeft = index < activeIndex;
              return (
                <motion.div
                  layout
                  key={tab.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.2 }}
                  className="railway-tab-slot"
                >
                  <div
                    className={`railway-inactive-tab ${isLeft ? 'is-slant-left' : 'is-slant-right'}`}
                    role="tab"
                    aria-selected="false"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="tab-inner-content">
                      {/* Site Icon */}
                      <div className="railway-inactive-badge" aria-hidden="true">
                        {renderTabFavicon(tab)}
                      </div>

                      {/* Clean Tab Title */}
                      <span className="railway-inactive-title">{title}</span>

                      {/* Close Button */}
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
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* New Tab Button (+) pinned inside the black island */}
        <button
          type="button"
          className="railway-add-tab-btn"
          onClick={() => openTab('', 'New Tab')}
          title="Open New Tab"
          aria-label="New Tab"
        >
          <Plus size={13} strokeWidth={2.4} />
        </button>
      </motion.div>
    </div>
  );
};

export default TopTabsBar;
