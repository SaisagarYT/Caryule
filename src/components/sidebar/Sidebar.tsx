import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Columns2, MessageSquare, CircleUser } from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import type { SidebarProps, ActivePage } from '../../types';
import './Sidebar.css';

const springTransition = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { activePage, setActivePage } = useBrowserStore();
  const [hoveredPage, setHoveredPage] = useState<ActivePage | null>(null);

  const mainNavItems: Array<{ id: ActivePage; label: string; icon: React.ReactNode }> = [
    {
      id: 'single-browser',
      label: 'Single Browser Agentic Page',
      icon: <Globe size={19} strokeWidth={1.8} />,
    },
    {
      id: 'multi-browser',
      label: 'Browser Multitasking Agentic Page',
      icon: <Columns2 size={18} strokeWidth={1.8} />,
    },
    {
      id: 'ai-chat',
      label: 'AI Chat Interface',
      icon: <MessageSquare size={18} strokeWidth={1.8} />,
    },
  ];

  const renderNavButton = (id: ActivePage, label: string, icon: React.ReactNode) => {
    const isActive = activePage === id;
    const isHovered = hoveredPage === id;

    return (
      <button
        key={id}
        type="button"
        className={`sidebar-icon-btn ${isActive ? 'is-active' : ''}`}
        onClick={() => setActivePage(id)}
        onMouseEnter={() => setHoveredPage(id)}
        onMouseLeave={() => setHoveredPage(null)}
        title={label}
        aria-label={label}
      >
        {/* Liquid Active Sliding Pill */}
        {isActive && (
          <>
            <motion.div
              layoutId="sidebar-active-pill"
              className="sidebar-active-pill"
              transition={springTransition}
            />
            <motion.div
              layoutId="sidebar-active-bar"
              className="sidebar-active-bar"
              transition={springTransition}
            />
          </>
        )}

        {/* Liquid Hover Indicator */}
        <AnimatePresence>
          {!isActive && isHovered && (
            <motion.div
              layoutId="sidebar-hover-pill"
              className="sidebar-hover-pill"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>

        {/* Icon Layer */}
        <span className="sidebar-icon-wrapper">
          {icon}
        </span>
      </button>
    );
  };

  return (
    <aside
      className={`sidebar ${className}`.trim()}
      aria-label="Sidebar Navigation"
      onMouseLeave={() => setHoveredPage(null)}
    >
      {/* Top Group: Logo Slot + 3 Main Pages */}
      <div className="sidebar-top-section">
        {/* Top Logo Component: Blank pitch black placeholder */}
        <div
          className="sidebar-logo-slot"
          aria-label="Application Logo Placeholder"
          title="Carule (Logo Placeholder)"
        />

        {/* 3 Main Pages */}
        <nav className="sidebar-nav-group" aria-label="Main Pages">
          {mainNavItems.map((item) => renderNavButton(item.id, item.label, item.icon))}
        </nav>
      </div>

      {/* Bottom Group: Profile Page Icon */}
      <div className="sidebar-bottom-section">
        {renderNavButton(
          'profile',
          'User Profile & Settings',
          <CircleUser size={20} strokeWidth={1.8} />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
