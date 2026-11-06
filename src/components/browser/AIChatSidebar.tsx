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
} from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import './AIChatSidebar.css';

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
  resultsCount?: number;
  sections?: MessageSection[];
}

export const AIChatSidebar: React.FC = () => {
  const { tabs, activeTabId, toggleAIChatSidebar } = useBrowserStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [expandedResultsId, setExpandedResultsId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [showFeedbackTooltip, setShowFeedbackTooltip] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'user',
      text: 'Create drafts to all my unread emails',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      thoughtTime: 'Thought for 9 seconds',
      thoughtDetails:
        'Scanned recent inbox threads, extracted sender contexts, prioritized pending replies, and synthesized tone guidelines.',
      resultsCount: 12,
      text: "Here's a compact summary of all the email-style content I can see in your workspace right now:",
      sections: [
        {
          title: '1. General studio intro / follow-up emails',
          bullets: [
            'Lué Studio is framed as a small but fiercely ambitious, multidisciplinary digital design and development studio, with strong experience across YC startups, creators, big exits, and bestselling authors.',
            'Standard opener acknowledges delayed responses with a warm apology and sets context that the team is meticulous and perfectionist about quality.',
          ],
        },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    const query = input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        thoughtTime: 'Thought for 3 seconds',
        thoughtDetails: `Analyzed query "${query}" against active workspace and browser context.`,
        resultsCount: 8,
        text: `Here is what I found regarding "${query}":`,
        sections: [
          {
            title: `1. Actionable findings for "${query}"`,
            bullets: [
              `Extracted relevant data from ${activeTab?.title || 'active browser tab'} and synthesized key insights.`,
              'Prepared high-confidence suggestions aligned with your project requirements and current browsing workflow.',
            ],
          },
        ],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 850);
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
  };

  const contextLabel = activeTab?.title
    ? activeTab.title.length > 20
      ? `${activeTab.title.slice(0, 18)}...`
      : activeTab.title
    : 'Intro Call: Oğuz...';

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
        {/* Header Bar */}
        <div className="clean-chat-header">
          {/* Left: New AI Chat dropdown trigger */}
          <button
            type="button"
            className="clean-chat-title-btn"
            title="Chat Sessions"
            aria-label="Chat Sessions"
          >
            <span>New AI Chat</span>
            <ChevronDown size={13} strokeWidth={2.2} className="clean-chevron-down" />
          </button>

          {/* Right Header Actions */}
          <div className="clean-header-actions">
            <button
              type="button"
              className="clean-header-icon-btn"
              onClick={handleNewChat}
              title="New Chat"
              aria-label="New Chat"
            >
              <SquarePen size={14} strokeWidth={1.9} />
            </button>

            <button
              type="button"
              className="clean-header-icon-btn"
              title="Split View / Sidebars"
              aria-label="Split View"
            >
              <Columns2 size={14} strokeWidth={1.9} />
            </button>

            <button
              type="button"
              className="clean-header-icon-btn clean-close-btn"
              onClick={toggleAIChatSidebar}
              title="Close chat"
              aria-label="Close chat"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="clean-chat-thread">
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

            return (
              <div key={m.id} className="clean-assistant-block">
                {/* 1. Thought Accordion Row */}
                {m.thoughtTime && (
                  <div className="clean-meta-accordion-wrap">
                    <button
                      type="button"
                      className="clean-thought-row"
                      onClick={() => setExpandedThoughtId(isThoughtOpen ? null : m.id)}
                    >
                      <Lightbulb size={13} strokeWidth={2} className="clean-meta-icon" />
                      <span className="clean-meta-label">{m.thoughtTime}</span>
                      <ChevronRight
                        size={12}
                        strokeWidth={2}
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

                {/* 2. Results / Sources Accordion Row */}
                {m.resultsCount && (
                  <div className="clean-meta-accordion-wrap">
                    <button
                      type="button"
                      className="clean-results-row"
                      onClick={() => setExpandedResultsId(isResultsOpen ? null : m.id)}
                    >
                      <Search size={13} strokeWidth={2} className="clean-meta-icon" />
                      <span className="clean-meta-label">{m.resultsCount} results</span>

                      {/* Source Icons Group */}
                      <div className="clean-source-badges">
                        <span className="clean-badge-icon badge-black">F</span>
                        <span className="clean-badge-avatar">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&auto=format&fit=crop&q=80"
                            alt="source"
                            className="clean-avatar-img"
                          />
                        </span>
                        <span className="clean-badge-count">3</span>
                      </div>

                      <ChevronRight
                        size={12}
                        strokeWidth={2}
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
                          <div className="clean-result-item">• Workspace thread: Marketing Strategy Q4</div>
                          <div className="clean-result-item">• Figma Design System component tokens</div>
                          <div className="clean-result-item">• Active Tab: {activeTab?.title || activeTab?.url || 'New Tab'}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 3. Message Text & Structure */}
                {m.text && <p className="clean-assistant-intro">{m.text}</p>}

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

                {/* 4. Action Toolbar */}
                <div className="clean-actions-toolbar">
                  <button
                    type="button"
                    className="clean-action-text-btn"
                    title="Insert to document or draft"
                  >
                    <CornerUpLeft size={12} strokeWidth={2.2} />
                    <span>Insert</span>
                  </button>

                  <span className="clean-action-divider" />

                  <button
                    type="button"
                    className="clean-action-icon-btn"
                    onClick={() => handleCopy(m.id, `${m.text}\n${m.sections?.map(s => s.bullets?.join('\n')).join('\n')}`)}
                    title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                  >
                    {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} strokeWidth={2} />}
                  </button>

                  {/* Thumbs Up with Share feedback Tooltip */}
                  <div
                    className="clean-action-tooltip-anchor"
                    onMouseEnter={() => setShowFeedbackTooltip(true)}
                    onMouseLeave={() => setShowFeedbackTooltip(false)}
                  >
                    <button
                      type="button"
                      className={`clean-action-icon-btn ${currentFeedback === 'up' ? 'active-feedback' : ''}`}
                      onClick={() => handleFeedback(m.id, 'up')}
                      title="Good response"
                    >
                      <ThumbsUp size={12} strokeWidth={2} />
                    </button>

                    {showFeedbackTooltip && (
                      <div className="clean-floating-tooltip">Share feedback</div>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`clean-action-icon-btn ${currentFeedback === 'down' ? 'active-feedback' : ''}`}
                    onClick={() => handleFeedback(m.id, 'down')}
                    title="Poor response"
                  >
                    <ThumbsDown size={12} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    className="clean-action-icon-btn"
                    title="Regenerate response"
                  >
                    <RotateCw size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="clean-assistant-block">
              <div className="clean-thought-row">
                <Lightbulb size={13} strokeWidth={2} className="clean-meta-icon animate-pulse" />
                <span className="clean-meta-label">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Composer Card */}
        <div className="clean-composer-wrapper">
          <form
            className="clean-composer-card"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            {/* Row 1: Context tags */}
            <div className="clean-composer-top-row">
              <button
                type="button"
                className="clean-at-btn"
                title="Mention context or files"
                aria-label="Add context"
              >
                @
              </button>

              <div className="clean-context-pill" title={activeTab?.url || 'Workspace Context'}>
                <span className="clean-pill-avatar">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&auto=format&fit=crop&q=80"
                    alt="avatar"
                    className="clean-pill-img"
                  />
                  <span className="clean-pill-badge">3</span>
                </span>
                <span className="clean-pill-text">{contextLabel}</span>
              </div>
            </div>

            {/* Row 2: Text input */}
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

            {/* Row 3: Bottom tools */}
            <div className="clean-composer-bottom-row">
              <div className="clean-composer-tools-left">
                <button
                  type="button"
                  className="clean-tool-btn"
                  title="Attach file"
                  aria-label="Attach file"
                >
                  <Paperclip size={13} strokeWidth={2} />
                </button>
                <span className="clean-tool-divider" />
                <button
                  type="button"
                  className="clean-model-btn"
                  title="Model selection"
                >
                  Auto
                </button>
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
