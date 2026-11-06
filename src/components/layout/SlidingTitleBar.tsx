import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Square, Copy, X } from 'lucide-react';
import './SlidingTitleBar.css';

export const SlidingTitleBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const isVisibleRef = useRef(false);
  isVisibleRef.current = isVisible;
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

  // Clear timeout helper
  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      closeTimeoutRef.current = null;
    }, 300);
  };

  // Top Edge Mouse Tracker: seamlessly triggers when cursor moves to top edge (y <= 8px),
  // and smoothly dismisses when cursor moves below the bar (y > 46px).
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 8) {
        clearCloseTimeout();
        setIsVisible(true);
      } else if (e.clientY > 46 && isVisibleRef.current) {
        if (!closeTimeoutRef.current) {
          closeTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            closeTimeoutRef.current = null;
          }, 300);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
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
      {/* Sliding Black Titlebar across the entire top of the window */}
      <AnimatePresence>
        {isVisible && (
          <motion.header
            className="sliding-titlebar"
            initial={{ y: -42, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -42, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleMaximize}
            aria-label="Window Titlebar"
          >
            {/* Draggable Drag Strip across the window */}
            <div className="sliding-titlebar-drag-region" onDoubleClick={handleMaximize}>
              <span className="sliding-titlebar-app-name">Carule</span>
            </div>

            {/* Window Controls at Far-Right (— ▢ ✕) */}
            <div className="sliding-titlebar-controls" aria-label="Window Controls">
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
