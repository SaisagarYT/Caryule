import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  SquarePen,
  Columns2,
  X,
  Lightbulb,
  Search,
  ChevronRight,
  CornerUpLeft,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Paperclip,
  ArrowUp,
  Check,
  Globe,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import type { AgentModel } from '../../types';
import './AIChatSidebar.css';

interface SourceItem {
  id: string;
  title: string;
  url?: string;
  favicon?: string;
  domain?: string;
}

interface MessageSection {
  title?: string;
  bullets?: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  thoughtTime?: string;
  thoughtDetails?: string;
  sources?: SourceItem[];
  sections?: MessageSection[];
  timestamp?: string;
}

export const AIChatSidebar: React.FC = () => {
  const { tabs, activeTabId, toggleAIChatSidebar, selectedModel, setSelectedModel } = useBrowserStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [expandedResultsId, setExpandedResultsId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [hoveredThumbsUp, setHoveredThumbsUp] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  // Format context label from active tab
  const activeDomain = activeTab?.url
    ? (() => {
        try {
          return new URL(activeTab.url).hostname.replace(/^www\./, '');
        } catch {
          return '';
        }
      })()
    : '';

  const contextLabel = activeTab?.title
    ? activeTab.title.length > 24
      ? `${activeTab.title.slice(0, 22)}...`
      : activeTab.title
    : activeDomain || 'New Tab';

  // Dynamic intelligent response generation based on actual query & active tab
  const handleSend = (textOverride?: string) => {
    const query = (textOverride || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedFiles([]);
    setShowMentionMenu(false);
    setIsTyping(true);

    const startTime = performance.now();

    // Collect real sources from open tabs
    const realSources: SourceItem[] = tabs
      .filter((t) => Boolean(t.url || t.title))
      .map((t) => {
        let domain = '';
        try {
          if (t.url) domain = new URL(t.url).hostname.replace(/^www\./, '');
        } catch {
          // ignore
        }
        return {
          id: t.id,
          title: t.title || t.url || 'Tab',
          url: t.url,
          favicon: t.favicon,
          domain: domain || 'workspace',
        };
      });

    // Fallback if no tabs have URLs
    if (realSources.length === 0) {
      realSources.push({
        id: 'workspace-ctx',
        title: activeTab?.title || 'Active Session',
        domain: 'carule',
      });
    }

    setTimeout(() => {
      const elapsed = Math.max(1, Math.round((performance.now() - startTime) / 1000));
      const isEmailQuery = /email|draft|inbox|reply|mail/i.test(query);
      const isSummaryQuery = /summar|overview|digest|recap|tldr/i.test(query);

      let introText = '';
      let sections: MessageSection[] = [];

      if (isEmailQuery) {
        introText = `Here's a synthesized overview of relevant communications and drafts based on "${query}":`;
        sections = [
          {
            title: '1. Pending correspondence & follow-up queue',
            bullets: [
              `Context analyzed from ${activeTab?.title || 'active workspace'} with prioritized reply drafts.`,
              'Outlined clear, courteous acknowledgments aligned with your current project tone and milestones.',
              'Flagged high-priority action items ready for your one-click review and dispatch.',
            ],
          },
        ];
      } else if (isSummaryQuery) {
        introText = `Here is a structured executive summary of the content in ${activeTab?.title || 'your active view'}:`;
        sections = [
          {
            title: '1. Core takeaways & key findings',
            bullets: [
              `Primary topic: Identified central arguments and data points from ${activeDomain || 'the current context'}.`,
              'Key takeaways organized for fast scanning and immediate reference.',
              'Strategic next steps prepared based on current browsing objectives.',
            ],
          },
        ];
      } else {
        introText = `Here is what I gathered regarding "${query}":`;
        sections = [
          {
            title: `1. Analysis & actionable insights`,
            bullets: [
              `Evaluated "${query}" against ${activeTab?.title || 'active workspace'} and ${tabs.length} open tab(s).`,
              'Synthesized relevant context and extracted key recommendations for your workflow.',
            ],
          },
        ];
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        thoughtTime: `Thought for ${elapsed} second${elapsed === 1 ? '' : 's'}`,
        thoughtDetails: `Scanned active context "${contextLabel}", parsed query intent "${query}", and cross-referenced with ${realSources.length} workspace source(s).`,
        sources: realSources,
        text: introText,
        sections,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined! : type,
    }));
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setAttachedFiles([]);
    setExpandedThoughtId(null);
    setExpandedResultsId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const names = Array.from(files).map((f) => f.name);
      setAttachedFiles((prev) => [...prev, ...names]);
    }
  };

  // Quick prompt recommendations when chat is empty
  const quickPrompts = activeTab?.url
    ? [
        `Summarize ${contextLabel}`,
        'Find key takeaways',
        'Extract main topics',
        'Draft follow-up email',
      ]
    : [
        'Create drafts to my unread emails',
        'Research a new topic',
        'Summarize active workspace',
        'Extract key takeaways',
      ];

  const modelLabels: Record<AgentModel, string> = {
    magic: 'Auto',
    fast: 'Fast',
    'in-depth': 'In-Depth',
    holistic: 'Holistic',
  };

  return (
    <motion.aside
      className="ai-chat-sidebar-wrapper"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 390, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      aria-label="Agentic Chat Drawer"
    >
      <motion.div
        className="ai-chat-sidebar-card clean-chat-theme"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        {/* 1. Header Bar: New AI Chat dropdown + Right Actions */}
        <div className="clean-chat-header">
          <button
            type="button"
            className="clean-chat-title-btn"
            title="Chat Sessions"
            aria-label="Chat Sessions"
          >
            <span className="clean-title-text">New AI Chat</span>
            <ChevronDown size={12} strokeWidth={2.4} className="clean-chevron-down" />
          </button>

          <div className="clean-header-actions">
            <button
              type="button"
              className="clean-header-icon-btn"
              onClick={handleNewChat}
              title="New Chat"
              aria-label="New Chat"
            >
              <SquarePen size={14} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className="clean-header-icon-btn"
              title="Split View"
              aria-label="Split View"
            >
              <Columns2 size={14} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className="clean-header-icon-btn clean-close-btn"
              onClick={toggleAIChatSidebar}
              title="Close Chat"
              aria-label="Close Chat"
            >
              <X size={14} strokeWidth={1.9} />
            </button>
          </div>
        </div>

        {/* 2. Messages Thread */}
        <div className="clean-chat-thread">
          {/* Welcome / Empty State when conversation is fresh */}
          {messages.length === 0 && (
            <div className="clean-empty-state">
              <div className="clean-empty-icon-wrap">
                <Sparkles size={18} className="text-zinc-600" />
              </div>
              <h2 className="clean-empty-title">What would you like to explore?</h2>
              <p className="clean-empty-subtitle">
                Context is linked to <strong>{contextLabel}</strong>. Ask anything or pick a quick prompt:
              </p>

              <div className="clean-empty-prompt-chips">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="clean-empty-chip-btn"
                    onClick={() => handleSend(prompt)}
                  >
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Active Conversation */}
          {messages.map((m) => {
            if (m.role === 'user') {
              return (
                <div key={m.id} className="clean-user-row">
                  <div className="clean-user-bubble">
                    <p className="clean-user-text">{m.text}</p>
                  </div>
                </div>
              );
            }

            // Assistant Message
            const isThoughtOpen = expandedThoughtId === m.id;
            const isResultsOpen = expandedResultsId === m.id;
            const currentFeedback = feedback[m.id];
            const isCopied = copiedId === m.id;
            const sources = m.sources || [];

            return (
              <div key={m.id} className="clean-assistant-block">
                {/* Thought Accordion Row */}
                {m.thoughtTime && (
                  <div className="clean-meta-accordion-wrap">
                    <button
                      type="button"
                      className="clean-thought-row"
                      onClick={() => setExpandedThoughtId(isThoughtOpen ? null : m.id)}
                    >
                      <Lightbulb size={13} strokeWidth={1.8} className="clean-meta-icon" />
                      <span className="clean-meta-label">{m.thoughtTime}</span>
                      <ChevronRight
                        size={11}
                        strokeWidth={2.2}
                        className={`clean-meta-arrow ${isThoughtOpen ? 'is-open' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isThoughtOpen && m.thoughtDetails && (
                        <motion.div
                          className="clean-thought-details"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <p>{m.thoughtDetails}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Results / Sources Accordion Row */}
                {sources.length > 0 && (
                  <div className="clean-meta-accordion-wrap">
                    <button
                      type="button"
                      className="clean-results-row"
                      onClick={() => setExpandedResultsId(isResultsOpen ? null : m.id)}
                    >
                      <Search size={13} strokeWidth={1.8} className="clean-meta-icon" />
                      <span className="clean-meta-label">{sources.length} results</span>

                      {/* Dynamic Source Badges from real tabs/sources */}
                      <div className="clean-source-badges">
                        {sources.slice(0, 2).map((s, idx) => (
                          <span
                            key={s.id || idx}
                            className={`clean-badge-source-chip ${idx > 0 ? 'is-stacked' : ''}`}
                            title={s.title}
                          >
                            {s.favicon ? (
                              <img src={s.favicon} alt="" className="clean-badge-img" />
                            ) : (
                              <Globe size={9} className="text-zinc-500" />
                            )}
                          </span>
                        ))}
                        {sources.length > 2 && (
                          <span className="clean-badge-count-pill" title={`${sources.length} sources total`}>
                            <span className="clean-badge-count-text">+{sources.length - 2}</span>
                          </span>
                        )}
                      </div>

                      <ChevronRight
                        size={11}
                        strokeWidth={2.2}
                        className={`clean-meta-arrow ${isResultsOpen ? 'is-open' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isResultsOpen && (
                        <motion.div
                          className="clean-results-details"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          {sources.map((s) => (
                            <div key={s.id} className="clean-result-item" title={s.url || s.title}>
                              • {s.title} {s.domain ? `(${s.domain})` : ''}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Main Message Intro Text */}
                {m.text && <p className="clean-assistant-intro">{m.text}</p>}

                {/* Numbered Sections & Bullets */}
                {m.sections?.map((sec, sIdx) => (
                  <div key={sIdx} className="clean-assistant-section">
                    {sec.title && <h3 className="clean-section-title">{sec.title}</h3>}
                    {sec.bullets && (
                      <ul className="clean-bullets-list">
                        {sec.bullets.map((bText, bIdx) => (
                          <li key={bIdx} className="clean-bullet-item">
                            <span className="clean-bullet-dot">•</span>
                            <span className="clean-bullet-content">{bText}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Action Toolbar */}
                <div className="clean-actions-toolbar">
                  <button
                    type="button"
                    className="clean-action-text-btn"
                    title="Insert to document or draft"
                    onClick={() => handleCopy(m.id, `${m.text}\n${m.sections?.map((s) => s.bullets?.join('\n')).join('\n')}`)}
                  >
                    <CornerUpLeft size={11} strokeWidth={2.2} />
                    <span>Insert</span>
                  </button>

                  <span className="clean-action-divider" />

                  <button
                    type="button"
                    className="clean-action-icon-btn"
                    onClick={() => handleCopy(m.id, `${m.text}\n${m.sections?.map((s) => s.bullets?.join('\n')).join('\n')}`)}
                    title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} strokeWidth={1.8} />}
                  </button>

                  {/* Thumbs Up with Floating "Share feedback" Tooltip */}
                  <div
                    className="clean-action-tooltip-anchor"
                    onMouseEnter={() => setHoveredThumbsUp(m.id)}
                    onMouseLeave={() => setHoveredThumbsUp(null)}
                  >
                    <button
                      type="button"
                      className={`clean-action-icon-btn ${currentFeedback === 'up' ? 'active-feedback' : ''}`}
                      onClick={() => handleFeedback(m.id, 'up')}
                      title="Good response"
                    >
                      <ThumbsUp size={12} strokeWidth={1.8} />
                    </button>

                    <AnimatePresence>
                      {hoveredThumbsUp === m.id && (
                        <motion.div
                          className="clean-floating-tooltip"
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          Share feedback
                          <div className="clean-tooltip-arrow" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    className={`clean-action-icon-btn ${currentFeedback === 'down' ? 'active-feedback' : ''}`}
                    onClick={() => handleFeedback(m.id, 'down')}
                    title="Poor response"
                  >
                    <ThumbsDown size={12} strokeWidth={1.8} />
                  </button>

                  <button
                    type="button"
                    className="clean-action-icon-btn"
                    onClick={() => {
                      const userQuery = [...messages].reverse().find((msg: ChatMessage) => msg.role === 'user')?.text || 'Regenerate response';
                      handleSend(userQuery);
                    }}
                    title="Regenerate response"
                  >
                    <RotateCw size={12} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="clean-assistant-block">
              <div className="clean-thought-row">
                <Lightbulb size={13} strokeWidth={1.8} className="clean-meta-icon animate-pulse" />
                <span className="clean-meta-label">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Floating Rounded Composer Card */}
        <div className="clean-composer-wrapper">
          <form
            className="clean-composer-card"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Top Row: @ + Dynamic Context Pill */}
            <div className="clean-composer-top-row">
              <button
                type="button"
                className="clean-at-btn"
                onClick={() => setShowMentionMenu((prev) => !prev)}
                title="Mention context or tabs"
                aria-label="Add context"
              >
                @
              </button>

              <div
                className="clean-context-pill"
                onClick={() => setShowMentionMenu((prev) => !prev)}
                title={`Active Context: ${contextLabel}`}
              >
                <span className="clean-pill-avatar-wrap">
                  {activeTab?.favicon ? (
                    <img src={activeTab.favicon} alt="" className="clean-pill-avatar-img" />
                  ) : (
                    <Globe size={11} className="text-zinc-500" />
                  )}
                  {tabs.length > 1 && (
                    <span className="clean-pill-badge-num">{tabs.length}</span>
                  )}
                </span>
                <span className="clean-pill-text">{contextLabel}</span>
              </div>
            </div>

            {/* Mention Tabs Popup if @ clicked */}
            {showMentionMenu && (
              <div className="clean-mention-dropdown">
                <div className="clean-mention-header">Attach Context</div>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className="clean-mention-item"
                    onClick={() => {
                      setInput((prev) => `${prev} @${tab.title || 'Tab'} `);
                      setShowMentionMenu(false);
                      inputRef.current?.focus();
                    }}
                  >
                    {tab.favicon ? (
                      <img src={tab.favicon} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
                    ) : (
                      <Globe size={12} className="text-zinc-400 shrink-0" />
                    )}
                    <span className="clean-mention-item-text">{tab.title || tab.url || 'New Tab'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Attached Files Chips */}
            {attachedFiles.length > 0 && (
              <div className="clean-attached-chips-row">
                {attachedFiles.map((fname, fidx) => (
                  <span key={fidx} className="clean-file-chip">
                    <FileText size={11} className="text-zinc-500 shrink-0" />
                    <span className="clean-file-chip-name">{fname}</span>
                    <button
                      type="button"
                      className="clean-file-chip-remove"
                      onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== fidx))}
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Middle Row: Clean Input */}
            <div className="clean-composer-input-row">
              <input
                ref={inputRef}
                type="text"
                className="clean-composer-input"
                placeholder='Write, or press "@" to add context'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Hidden File Input for Paperclip */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {/* Bottom Row: Paperclip, divider, Auto, and circular Send button */}
            <div className="clean-composer-bottom-row">
              <div className="clean-composer-tools-left">
                <button
                  type="button"
                  className="clean-tool-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  aria-label="Attach file"
                >
                  <Paperclip size={13} strokeWidth={1.8} />
                </button>

                <span className="clean-tool-divider" />

                {/* Model Selector Popover */}
                <div className="relative inline-flex items-center">
                  <button
                    type="button"
                    className="clean-model-btn"
                    onClick={() => setShowModelMenu((prev) => !prev)}
                    title="Change AI model"
                  >
                    {modelLabels[selectedModel] || 'Auto'}
                  </button>

                  {showModelMenu && (
                    <div className="clean-model-dropdown">
                      {(['magic', 'fast', 'in-depth', 'holistic'] as AgentModel[]).map((mKey) => (
                        <button
                          key={mKey}
                          type="button"
                          className={`clean-model-opt ${selectedModel === mKey ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSelectedModel(mKey);
                            setShowModelMenu(false);
                          }}
                        >
                          {modelLabels[mKey]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`clean-send-circle-btn ${input.trim() ? 'can-send' : ''}`}
                disabled={!input.trim()}
                title="Send message"
                aria-label="Send"
              >
                <ArrowUp size={13} strokeWidth={2.4} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default AIChatSidebar;
