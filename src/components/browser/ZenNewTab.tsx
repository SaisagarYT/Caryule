import React, { useState } from 'react';
import {
  Clock,
  PenSquare,
  Paperclip,
  Sparkles,
  Zap,
  CircleDashed,
  Wand2,
  Boxes,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrowserStore } from '../../store/useBrowserStore';
import type { AgentModel } from '../../types';
import './ZenNewTab.css';

export const ZenNewTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const { navigateActiveTab, selectedModel, setSelectedModel, setIslandState } =
    useBrowserStore();

  const handleSearchOrNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Simulate triggering agent / navigation in Dynamic Island
    setIslandState({
      status: 'navigating',
      message: `Navigating to ${query}`,
      details: 'Agent preparing DOM inspection',
      isExpanded: true,
    });

    navigateActiveTab(query);
  };

  const models: Array<{ id: AgentModel; label: string; icon: React.ReactNode }> = [
    { id: 'fast', label: 'Fast', icon: <Zap size={14} className="text-amber-500" /> },
    { id: 'in-depth', label: 'In-depth', icon: <CircleDashed size={14} className="text-blue-500" /> },
    { id: 'magic', label: 'Magic AI', icon: <Wand2 size={14} className="text-purple-500" /> },
    { id: 'holistic', label: 'Holistic', icon: <Boxes size={14} className="text-emerald-500" /> },
  ];

  return (
    <div className="zen-new-tab">
      {/* Top Left Navigation Shortcut */}
      <div className="zen-top-actions">
        <button className="zen-action-btn" title="Recent History">
          <Clock size={16} />
        </button>
        <button className="zen-action-btn" title="New Note / Draft">
          <PenSquare size={16} />
        </button>
      </div>

      <motion.div
        className="zen-center-content"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Zen / Brand Logo */}
        <div className="zen-logo flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 stroke-current text-zinc-900 fill-none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="3.6" y1="9" x2="20.4" y2="15" />
          </svg>
        </div>

        <h1 className="zen-heading">Hey! I'm Carule</h1>
        <p className="zen-subheading">Tell me everything you need to browse, research, or automate</p>

        {/* Floating Omnibar Prompt Card */}
        <form onSubmit={handleSearchOrNavigate} className="zen-prompt-card">
          <input
            type="text"
            className="zen-prompt-input"
            placeholder="Ask anything or enter a URL..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          <div className="zen-prompt-toolbar">
            <div className="zen-toolbar-left">
              <button type="button" className="zen-tool-pill" title="Attach file or context">
                <Paperclip size={13} />
              </button>
              <button
                type="button"
                className="zen-tool-pill"
                onClick={() =>
                  setIslandState({
                    status: 'thinking',
                    message: 'Deep search indexing active tabs',
                    isExpanded: true,
                  })
                }
              >
                <Compass size={13} />
                <span>Deep search</span>
              </button>
              <button
                type="button"
                className="zen-tool-pill"
                onClick={() =>
                  setIslandState({
                    status: 'thinking',
                    message: 'Thinking',
                    details: 'Read app-sidebar.tsx 219 lines',
                    isExpanded: true,
                  })
                }
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Think</span>
              </button>
            </div>

            <div className="zen-toolbar-right">
              <button type="submit" className="zen-model-pill group">
                <span className="capitalize">{selectedModel}</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </form>

        {/* Model Selector Chips */}
        <div className="zen-model-chips">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`zen-chip ${selectedModel === m.id ? 'is-active' : ''}`}
              onClick={() => setSelectedModel(m.id)}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ZenNewTab;

