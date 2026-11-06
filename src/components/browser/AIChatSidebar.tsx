import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Select from '@radix-ui/react-select';
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
  Table2,
  Plus,
  Mic,
  Square,
  Cpu,
  Bot,
  Zap,
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

interface ModelOption {
  value: AgentModel;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const MODEL_OPTIONS: ModelOption[] = [
  {
    value: 'magic',
    name: 'Auto (Magic)',
    badge: 'Default',
    badgeColor: 'badge-emerald',
    description: 'Dynamic intelligence, auto-selects optimal model',
    icon: Sparkles,
  },
  {
    value: 'in-depth',
    name: 'Claude 3.5 Sonnet',
    badge: 'Reasoning',
    badgeColor: 'badge-violet',
    description: 'Advanced deep research, web analysis & synthesis',
    icon: Cpu,
  },
  {
    value: 'holistic',
    name: 'GPT-4o Omniscient',
    badge: 'Multimodal',
    badgeColor: 'badge-sky',
    description: 'Full workspace context, speed & vision reasoning',
    icon: Bot,
  },
  {
    value: 'fast',
    name: 'Claude 3.5 Haiku',
    badge: 'Ultra Fast',
    badgeColor: 'badge-amber',
    description: 'Instant responses, lightweight page summaries',
    icon: Zap,
  },
];

// Stylized bot state animation icon matching reference prompt diagram
const BotStateIcon: React.FC<{ isRunning: boolean; isPaused: boolean }> = ({ isRunning }) => {
  return (
    <div className={`bot-state-icon-container ${isRunning ? 'is-running' : ''}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer stylized eye contour */}
        <path
          d="M2.5 12C4.5 7 8 3.5 12 3.5C16 3.5 19.5 7 21.5 12C19.5 17 16 20.5 12 20.5C8 20.5 4.5 17 2.5 12Z"
          stroke="#107548"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner pupil circle */}
        <circle cx="12" cy="12" r="3.6" fill="#107548" />
        {/* Top-right sparkle star */}
        <path
          d="M18.5 2.5L19.2 4.8L21.5 5.5L19.2 6.2L18.5 8.5L17.8 6.2L15.5 5.5L17.8 4.8L18.5 2.5Z"
          fill="#107548"
        />
      </svg>
    </div>
  );
};

export const AIChatSidebar: React.FC = () => {
  const { tabs, activeTabId, toggleAIChatSidebar, selectedModel, setSelectedModel } = useBrowserStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'paused'>('running');
  const [isListening, setIsListening] = useState(false);
  const [contextName, setContextName] = useState('Competitor Analysis');
  const [showContextPicker, setShowContextPicker] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [expandedResultsId, setExpandedResultsId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [hoveredThumbsUp, setHoveredThumbsUp] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => textareaRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  // Sync active tab into context name if not custom
  useEffect(() => {
    if (activeTab?.title && contextName === 'Competitor Analysis' && activeTab.title !== 'New Tab') {
      // Keep 'Competitor Analysis' as default to match user's image, or update when user picks tab
    }
  }, [activeTab, contextName]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
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
    setShowContextPicker(false);
    setIsTyping(true);
    setAgentStatus('running');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

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
        title: activeTab?.title || contextName || 'Active Session',
        domain: 'carule',
      });
    }

    if (runTimeoutRef.current) clearTimeout(runTimeoutRef.current);

    runTimeoutRef.current = setTimeout(() => {
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
              `Context analyzed from ${contextName || activeTab?.title || 'active workspace'} with prioritized reply drafts.`,
              'Outlined clear, courteous acknowledgments aligned with your current project tone and milestones.',
              'Flagged high-priority action items ready for your one-click review and dispatch.',
            ],
          },
        ];
      } else if (isSummaryQuery) {
        introText = `Here is a structured executive summary of the content in ${contextName || activeTab?.title || 'your active view'}:`;
        sections = [
          {
            title: '1. Core takeaways & key findings',
            bullets: [
              `Primary topic: Identified central arguments and data points from ${contextName || activeDomain || 'the current context'}.`,
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
              `Evaluated "${query}" against ${contextName || activeTab?.title || 'active workspace'} and ${tabs.length} open tab(s).`,
              'Synthesized relevant context and extracted key recommendations for your workflow.',
            ],
          },
        ];
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        thoughtTime: `Thought for ${elapsed} second${elapsed === 1 ? '' : 's'}`,
        thoughtDetails: `Scanned active context "${contextName}", parsed query intent "${query}", and cross-referenced with ${realSources.length} workspace source(s).`,
        sources: realSources,
        text: introText,
        sections,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      setAgentStatus('idle');
    }, 900);
  };

  // Stop process button handler
  const handleStop = () => {
    if (runTimeoutRef.current) {
      clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }
    setIsTyping(false);
    setAgentStatus('idle');
  };

  // Pause / Resume toggle
  const togglePause = () => {
    if (agentStatus === 'running') {
      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = null;
      }
      setAgentStatus('paused');
    } else if (agentStatus === 'paused') {
      setAgentStatus('running');
      setIsTyping(true);
      runTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setAgentStatus('idle');
      }, 800);
    } else {
      // Idle -> start running demonstration
      setAgentStatus('running');
    }
  };

  // Voice input speech-to-text toggle
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        setIsListening(false);
      }
    } else {
      // Interactive simulated voice input for dev/webview
      setIsListening(true);
      setTimeout(() => {
        setInput((prev) =>
          prev
            ? `${prev} Show me who's using the keyword in H1`
            : "Show me who's using the keyword in H1, and sort by page load time descending"
        );
        setIsListening(false);
      }, 1200);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    setAgentStatus('idle');
    setIsTyping(false);
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
        `Summarize ${contextName}`,
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

  const currentModelLabel =
    MODEL_OPTIONS.find((m) => m.value === selectedModel)?.name.split(' ')[0] || 'Auto';

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
                Context is linked to <strong>{contextName}</strong>. Ask anything or pick a quick prompt:
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
                              <div className="clean-result-item-left">
                                {s.favicon ? (
                                  <img src={s.favicon} alt="" className="clean-result-favicon" />
                                ) : (
                                  <Globe size={11} className="text-zinc-400 shrink-0" />
                                )}
                                <span className="clean-result-title">{s.title}</span>
                              </div>
                              <span className="clean-result-domain">{s.domain}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Assistant Prose */}
                {m.text && <p className="clean-assistant-intro">{m.text}</p>}

                {/* Structured Sections */}
                {m.sections &&
                  m.sections.map((sec, secIdx) => (
                    <div key={secIdx} className="clean-section-block">
                      {sec.title && <h3 className="clean-section-title">{sec.title}</h3>}
                      {sec.bullets && (
                        <ul className="clean-section-bullets">
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

                {/* Bottom Action Bar */}
                <div className="clean-action-bar">
                  <button
                    type="button"
                    className="clean-insert-btn"
                    onClick={() => {
                      const fullText = [
                        m.text,
                        ...(m.sections || []).map(
                          (s) => `${s.title}\n${(s.bullets || []).map((b) => `- ${b}`).join('\n')}`
                        ),
                      ]
                        .filter(Boolean)
                        .join('\n\n');
                      handleCopy(m.id, fullText);
                    }}
                    title="Insert to document or draft"
                  >
                    <CornerUpLeft size={11} strokeWidth={2} />
                    <span>Insert</span>
                  </button>

                  <button
                    type="button"
                    className="clean-action-icon-btn"
                    onClick={() => {
                      const fullText = [
                        m.text,
                        ...(m.sections || []).map(
                          (s) => `${s.title}\n${(s.bullets || []).map((b) => `- ${b}`).join('\n')}`
                        ),
                      ]
                        .filter(Boolean)
                        .join('\n\n');
                      handleCopy(m.id, fullText);
                    }}
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

        {/* 3. Floating Prompt Design Input Bar (Matching Exact Reference Layout & Architecture) */}
        <div className="clean-composer-wrapper">
          <div className="prompt-design-card">
            {/* Status Header Banner: State animation icon + Bot activity msg + Bot status */}
            <div
              className={`prompt-status-banner ${
                agentStatus === 'running'
                  ? 'is-running'
                  : agentStatus === 'paused'
                  ? 'is-paused'
                  : 'is-idle'
              }`}
            >
              <div className="prompt-status-left">
                <BotStateIcon isRunning={agentStatus === 'running'} isPaused={agentStatus === 'paused'} />
                <span className="prompt-status-text">
                  {agentStatus === 'running' ? 'Running ...' : agentStatus === 'paused' ? 'Paused' : 'Running ...'}
                </span>
              </div>

              <button
                type="button"
                className={`prompt-status-right-btn ${agentStatus === 'paused' ? 'is-paused' : ''}`}
                onClick={togglePause}
                title={agentStatus === 'paused' ? 'Resume execution' : 'Pause execution'}
                aria-label="Toggle pause"
              >
                <span className="prompt-pause-glyph">||</span>
                <span>Paused</span>
              </button>
            </div>

            {/* Inner Prompt Card Body */}
            <div className="prompt-card-body">
              {/* Context Row: Context Pill + Dashed Add Button */}
              <div className="prompt-context-row">
                <button
                  type="button"
                  className="prompt-context-pill"
                  onClick={() => setShowContextPicker((prev) => !prev)}
                  title={`Active context: ${contextName}`}
                >
                  <Table2 size={13} className="text-zinc-600 shrink-0" strokeWidth={1.8} />
                  <span className="prompt-context-pill-text">{contextName}</span>
                </button>

                <button
                  type="button"
                  className="prompt-add-context-btn"
                  onClick={() => setShowContextPicker((prev) => !prev)}
                  title="Add more context sources"
                  aria-label="Add context"
                >
                  <Plus size={13} strokeWidth={2.2} />
                </button>
              </div>

              {/* Context Picker Dropdown */}
              <AnimatePresence>
                {showContextPicker && (
                  <motion.div
                    className="prompt-context-dropdown"
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="prompt-dropdown-header">Context Sources</div>
                    <button
                      type="button"
                      className={`prompt-dropdown-item ${contextName === 'Competitor Analysis' ? 'is-active' : ''}`}
                      onClick={() => {
                        setContextName('Competitor Analysis');
                        setShowContextPicker(false);
                      }}
                    >
                      <Table2 size={13} className="text-emerald-600 shrink-0" />
                      <span>Competitor Analysis (Page Elements)</span>
                    </button>
                    <button
                      type="button"
                      className={`prompt-dropdown-item ${contextName === (activeTab?.title || 'Active Tab') ? 'is-active' : ''}`}
                      onClick={() => {
                        setContextName(activeTab?.title || 'Active Tab');
                        setShowContextPicker(false);
                      }}
                    >
                      <Globe size={13} className="text-blue-500 shrink-0" />
                      <span>Active Tab: {activeTab?.title || 'New Tab'}</span>
                    </button>
                    {tabs
                      .filter((t) => t.id !== activeTabId)
                      .map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          className={`prompt-dropdown-item ${contextName === (tab.title || tab.url) ? 'is-active' : ''}`}
                          onClick={() => {
                            setContextName(tab.title || tab.url || 'Tab');
                            setShowContextPicker(false);
                          }}
                        >
                          {tab.favicon ? (
                            <img src={tab.favicon} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" />
                          ) : (
                            <Globe size={13} className="text-zinc-400 shrink-0" />
                          )}
                          <span>{tab.title || tab.url || 'Tab'}</span>
                        </button>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attached Files Chips */}
              {attachedFiles.length > 0 && (
                <div className="prompt-attached-chips-row">
                  {attachedFiles.map((fname, fidx) => (
                    <span key={fidx} className="prompt-file-chip">
                      <FileText size={11} className="text-zinc-500 shrink-0" />
                      <span className="prompt-file-chip-name">{fname}</span>
                      <button
                        type="button"
                        className="prompt-file-chip-remove"
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== fidx))}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Prompt Text Input Area (Auto-expanding multi-line) */}
              <div className="prompt-textarea-row">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  className="prompt-textarea"
                  placeholder="Show me who's using the keyword in H1, and sort by page load time descending"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Hidden File Input for Attach */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />

              {/* Bottom Toolbar: Attach + Premium Model Select Dropdown + Voice + Send/Stop */}
              <div className="prompt-bottom-toolbar">
                <div className="prompt-tools-left">
                  {/* Attach Button */}
                  <button
                    type="button"
                    className="prompt-tool-pill-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach documents"
                    aria-label="Attach documents"
                  >
                    <Paperclip size={12.5} strokeWidth={1.9} />
                    <span>Attach</span>
                  </button>

                  {/* Premium Model Selection Dropdown using Radix UI Select */}
                  <Select.Root
                    value={selectedModel}
                    onValueChange={(val) => setSelectedModel(val as AgentModel)}
                  >
                    <Select.Trigger
                      className="prompt-tool-pill-btn prompt-model-select-trigger"
                      aria-label="Select Intelligence Model"
                    >
                      <Sparkles size={12} className="text-emerald-600 shrink-0" />
                      <Select.Value>
                        <span>{currentModelLabel}</span>
                      </Select.Value>
                      <Select.Icon className="prompt-model-chevron">
                        <ChevronDown size={11} strokeWidth={2} />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content
                        className="prompt-model-select-content"
                        position="popper"
                        sideOffset={8}
                        align="start"
                      >
                        <div className="prompt-model-menu-header">
                          <span className="prompt-model-menu-title">Select Intelligence Model</span>
                          <span className="prompt-model-menu-badge">Premium</span>
                        </div>

                        <Select.Viewport className="prompt-model-select-viewport">
                          {MODEL_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            return (
                              <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="prompt-model-select-item"
                              >
                                <div className="prompt-model-item-left">
                                  <div className="prompt-model-icon-box">
                                    <Icon size={14} className="text-zinc-700" />
                                  </div>
                                  <div className="prompt-model-text-stack">
                                    <div className="prompt-model-name-row">
                                      <span className="prompt-model-item-title">
                                        <Select.ItemText>{opt.name}</Select.ItemText>
                                      </span>
                                      <span className={`prompt-model-item-badge ${opt.badgeColor}`}>
                                        {opt.badge}
                                      </span>
                                    </div>
                                    <span className="prompt-model-item-desc">{opt.description}</span>
                                  </div>
                                </div>

                                <Select.ItemIndicator className="prompt-model-indicator">
                                  <Check size={13} className="text-emerald-600 stroke-[2.5]" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            );
                          })}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div className="prompt-tools-right">
                  {/* Voice Input */}
                  <button
                    type="button"
                    className={`prompt-voice-btn ${isListening ? 'is-listening' : ''}`}
                    onClick={toggleVoiceInput}
                    title={isListening ? 'Listening... click to stop' : 'Voice input'}
                    aria-label="Voice input"
                  >
                    <Mic size={15} strokeWidth={1.8} />
                  </button>

                  {/* Send Prompt / Stop Process Circle Button */}
                  <button
                    type="button"
                    className={`prompt-send-stop-circle-btn ${
                      agentStatus === 'running' || isTyping
                        ? 'is-running'
                        : input.trim()
                        ? 'can-send'
                        : 'is-idle'
                    }`}
                    onClick={() => {
                      if (agentStatus === 'running' || isTyping) {
                        handleStop();
                      } else if (input.trim()) {
                        handleSend();
                      }
                    }}
                    title={agentStatus === 'running' || isTyping ? 'Stop process' : 'Send prompt'}
                    aria-label={agentStatus === 'running' || isTyping ? 'Stop process' : 'Send prompt'}
                    disabled={agentStatus === 'idle' && !isTyping && !input.trim()}
                  >
                    {agentStatus === 'running' || isTyping ? (
                      <Square size={10} fill="currentColor" />
                    ) : (
                      <ArrowUp size={13} strokeWidth={2.4} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
};

export default AIChatSidebar;
