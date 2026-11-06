import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, X, RotateCcw, Bot, User, Globe, ArrowRight } from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import './AIChatSidebar.css';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const AIChatSidebar: React.FC = () => {
  const { tabs, activeTabId, toggleAIChatSidebar } = useBrowserStore();
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am your agentic browsing assistant. How can I help you explore, summarize, or analyze this page?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Focus input on mount
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate smart agent response
    setTimeout(() => {
      let reply = `I've analyzed "${query}". `;
      if (activeTab?.url) {
        reply += `Looking at "${activeTab.title || activeTab.url}", here are the key insights and details regarding your query.`;
      } else {
        reply += `I can search the web or assist you with any research task. Feel free to navigate to a page or ask more questions!`;
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: 'Conversation cleared. How can I assist you next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    'Summarize this page',
    'Find key takeaways',
    'Extract main topics',
    'Explain like I am 5',
  ];

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
        className="ai-chat-sidebar-card"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        {/* Header */}
        <div className="ai-sidebar-header">
          <div className="ai-sidebar-header-left">
            <div className="ai-sidebar-avatar-icon">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="ai-sidebar-titles">
              <h2 className="ai-sidebar-title">Agentic AI</h2>
              <span className="ai-sidebar-status">
                <span className="ai-status-pulse" />
                Online
              </span>
            </div>
          </div>

          <div className="ai-sidebar-header-actions">
            <button
              type="button"
              className="ai-sidebar-tool-btn"
              onClick={handleClear}
              title="Clear conversation"
              aria-label="Clear chat"
            >
              <RotateCcw size={13} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="ai-sidebar-tool-btn ai-sidebar-close-btn"
              onClick={toggleAIChatSidebar}
              title="Close chat"
              aria-label="Close chat"
            >
              <X size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Tab Context Banner */}
        {activeTab?.url && (
          <div className="ai-sidebar-context-banner" title={activeTab.url}>
            <Globe size={12} className="text-zinc-500 shrink-0" />
            <span className="ai-sidebar-context-text">
              Context: <strong>{activeTab.title || activeTab.url}</strong>
            </span>
          </div>
        )}

        {/* Messages Thread */}
        <div className="ai-sidebar-thread">
          {messages.map((m) => (
            <div key={m.id} className={`ai-side-msg-row ${m.role}`}>
              {m.role === 'assistant' && (
                <div className="ai-side-msg-avatar">
                  <Bot size={13} strokeWidth={2.2} />
                </div>
              )}
              <div className="ai-side-msg-bubble">
                <p className="ai-side-msg-text">{m.text}</p>
                <span className="ai-side-msg-time">{m.timestamp}</span>
              </div>
              {m.role === 'user' && (
                <div className="ai-side-msg-avatar user">
                  <User size={13} strokeWidth={2.2} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="ai-side-msg-row assistant">
              <div className="ai-side-msg-avatar">
                <Bot size={13} strokeWidth={2.2} />
              </div>
              <div className="ai-side-msg-bubble is-typing">
                <span className="ai-typing-dot" />
                <span className="ai-typing-dot" />
                <span className="ai-typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="ai-sidebar-quick-prompts">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="ai-sidebar-prompt-pill"
              onClick={() => handleSend(prompt)}
            >
              <span>{prompt}</span>
              <ArrowRight size={10} className="ai-prompt-arrow" />
            </button>
          ))}
        </div>

        {/* Composer Form */}
        <form
          className="ai-sidebar-composer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="ai-sidebar-input-pod">
            <input
              ref={inputRef}
              type="text"
              className="ai-sidebar-input"
              placeholder="Ask Agentic AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className={`ai-sidebar-send-btn ${input.trim() ? 'can-send' : ''}`}
              disabled={!input.trim()}
              title="Send message"
              aria-label="Send"
            >
              <Send size={13} strokeWidth={2.2} />
            </button>
          </div>
        </form>
      </motion.div>
    </motion.aside>
  );
};

export default AIChatSidebar;