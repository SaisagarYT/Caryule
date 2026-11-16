import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Square, Copy, X, Sun, Moon } from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import './SlidingTitleBar.css';

export const SlidingTitleBar: React.FC = () => {
  const { theme, toggleTheme } = useBrowserStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const isVisibleRef = useRef(false);
  isVisibleRef.current = isVisible;
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync maximized state with Electron
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI) return;

    window.electronAPI.isMaximized?.().then((max) => {
      setIsMaximized(Boolean(max));
    });

    const unsubscribe = window.electronAPI.onMaximizeChange?.((max) => {
      setIsMaximized(max);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const OPEN_DELAY_MS = 250; // Small intentional hover delay (1/4 sec) before opening
  const CLOSE_DELAY_MS = 500; // 0.5-second grace period before closing

  // Clear timeout helpers
  const clearOpenTimeout = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Schedule opening after intentionally hovering at top edge for OPEN_DELAY_MS
  const scheduleOpen = () => {
    clearCloseTimeout();
    if (isVisibleRef.current) return;
    if (!openTimeoutRef.current) {
      openTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        openTimeoutRef.current = null;
      }, OPEN_DELAY_MS);
    }
  };

  // Schedule closing after cursor leaves the top area
  const scheduleClose = () => {
    clearOpenTimeout();
    if (!isVisibleRef.current) return;
    if (!closeTimeoutRef.current) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        closeTimeoutRef.current = null;
      }, CLOSE_DELAY_MS);
    }
  };

  const handleBarMouseEnter = () => {
    clearOpenTimeout();
    clearCloseTimeout();
    setIsVisible(true);
  };

  // Top Edge Mouse Tracker: requires dwelling at the top edge (y <= 10px) for OPEN_DELAY_MS to open,
  // cancels accidental flicks, keeps the bar open while on the bar (y <= 42px),
  // and waits 1.5s before dismissing when moved below (y > 48px).
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        scheduleOpen();
      } else if (e.clientY <= 42 && isVisibleRef.current) {
        clearCloseTimeout();
        clearOpenTimeout();
      } else {
        clearOpenTimeout(); // Cancels opening if cursor simply flicked past top edge
        if (e.clientY > 48 && isVisibleRef.current) {
          scheduleClose();
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      clearOpenTimeout();
      clearCloseTimeout();
    };
  }, []);

  // Window control actions
  const handleMinimize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.electronAPI?.maximizeWindow) {
      window.electronAPI.maximizeWindow();
    } else {
      setIsMaximized((prev) => !prev);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <>
      {/* Invisible Top Edge Trigger Zone across the entire window ceiling */}
      <div
        className="sliding-titlebar-trigger-zone"
        onMouseEnter={scheduleOpen}
        onMouseMove={scheduleOpen}
        onMouseLeave={clearOpenTimeout}
        aria-hidden="true"
      />

      {/* Sliding Black Titlebar across the entire top of the window */}
      <AnimatePresence>
        {isVisible && (
          <motion.header
            className="sliding-titlebar"
            initial={{ y: -42, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -42, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onMouseEnter={handleBarMouseEnter}
            onMouseLeave={scheduleClose}
            onDoubleClick={handleMaximize}
            aria-label="Window Titlebar"
          >
            {/* Draggable Drag Strip across the window */}
            <div className="sliding-titlebar-drag-region" onDoubleClick={handleMaximize}>
              <span className="sliding-titlebar-app-name">Carule</span>
            </div>

            {/* Window Controls at Far-Right (Theme, — ▢ ✕) */}
            <div className="sliding-titlebar-controls" aria-label="Window Controls">
              <button
                type="button"
                className="sliding-control-btn btn-theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={13} strokeWidth={2} /> : <Moon size={13} strokeWidth={2} />}
              </button>

              <button
                type="button"
                className="sliding-control-btn btn-minimize"
                onClick={handleMinimize}
                onMouseDown={handleMinimize}
                title="Minimize Window"
                aria-label="Minimize"
              >
                <Minus size={13} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                className="sliding-control-btn btn-maximize"
                onClick={handleMaximize}
                onMouseDown={handleMaximize}
                title={isMaximized ? 'Restore Window' : 'Maximize Window'}
                aria-label={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? (
                  <Copy size={11} strokeWidth={2.2} className="rotate-180" />
                ) : (
                  <Square size={11} strokeWidth={2.2} />
                )}
              </button>

              <button
                type="button"
                className="sliding-control-btn btn-close"
                onClick={handleClose}
                onMouseDown={handleClose}
                title="Close Window"
                aria-label="Close"
              >
                <X size={13} strokeWidth={2.2} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
};

export default SlidingTitleBar;
