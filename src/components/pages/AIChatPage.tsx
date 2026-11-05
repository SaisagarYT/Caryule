import React, { useState } from 'react';
import { Send, User, Bot } from 'lucide-react';
import './AIChatPage.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Hello! How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: 'user', text: userText },
      {
        id: String(Date.now() + 1),
        role: 'assistant',
        text: `You asked: "${userText}". Here is the answer to your inquiry.`,
      },
    ]);
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <span className="font-semibold text-sm text-zinc-800">Chat</span>
      </div>

      <div className="ai-chat-thread">
        {messages.map((m) => (
          <div key={m.id} className={`ai-message-row ${m.role}`}>
            <div className="ai-message-avatar">
              {m.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
            </div>
            <div className="ai-message-bubble">
              <p className="ai-message-text">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="ai-composer-form">
        <div className="ai-composer-bar">
          <input
            type="text"
            className="ai-composer-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="ai-composer-send-btn" title="Send">
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatPage;
