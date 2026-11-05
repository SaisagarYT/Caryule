import React, { useState, useRef } from 'react';
import { useBrowserStore } from '../../store/useBrowserStore';
import './ZenCenter.css';

interface QuickShortcut {
  id: string;
  name: string;
  url: string;
  bg: string;
  renderIcon: () => React.ReactNode;
}

const SHORTCUTS: QuickShortcut[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com',
    bg: '#ff0000',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
        <path d="M9.5 7.5v9l7-4.5-7-4.5z" />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    bg: '#24292e',
    renderIcon: () => (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
      </svg>
    ),
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    bg: '#2b2b2b',
    renderIcon: () => (
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: '22px',
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        W
      </span>
    ),
  },
  {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://www.reddit.com',
    bg: '#ff4500',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
        <circle cx="12" cy="12" r="4.5" />
      </svg>
    ),
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    bg: '#10a37f',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
        <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X / Twitter',
    url: 'https://x.com',
    bg: '#000000',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="#ffffff">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export const ZenCenter: React.FC = () => {
  const [value, setValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { navigateActiveTab } = useBrowserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim()) {
      navigateActiveTab('https://www.google.com');
      return;
    }
    navigateActiveTab(value.trim());
  };

  const handleFeelingLucky = () => {
    if (!value.trim()) {
      navigateActiveTab('https://www.google.com/doodles');
    } else {
      navigateActiveTab(`https://www.google.com/search?btnI=1&q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported by your browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue(transcript);
        setIsListening(false);
        navigateActiveTab(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleLensClick = () => {
    navigateActiveTab('https://images.google.com');
  };

  return (
    <div className="zen-center-container">
      {/* Brand Row: Sleek Squircle Badge + Carule Title */}
      <div className="zen-brand-row">
        <div className="zen-brand-badge" aria-hidden="true" />
        <h1 className="zen-brand-title">Carule</h1>
      </div>

      {/* Elevated Capsule Search Bar */}
      <form onSubmit={handleSubmit} className="zen-input-form">
        <div className={`zen-input-bar ${isListening ? 'is-listening' : ''}`}>
          {/* Multi-color Google 'G' Icon */}
          <svg className="zen-google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          {/* Search or URL Input */}
          <input
            type="text"
            className="zen-address-input"
            placeholder="Search Google or type a URL"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />

          {/* Right Action Buttons inside the Capsule: Voice Search & Camera */}
          <div className="zen-input-actions">
            <button
              type="button"
              className={`zen-action-icon-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceSearch}
              title={isListening ? 'Listening...' : 'Search by voice'}
              aria-label="Voice search"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>

            <button
              type="button"
              className="zen-action-icon-btn"
              onClick={handleLensClick}
              title="Search by image (Google Lens)"
              aria-label="Google Lens"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm11 16H4V6h4.05l1.83-2h4.24l1.83 2H20v12z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Buttons Row: Google Search & I'm Feeling Lucky */}
        <div className="zen-buttons-row">
          <button type="submit" className="zen-search-btn">
            Google Search
          </button>
          <button type="button" className="zen-search-btn" onClick={handleFeelingLucky}>
            I'm Feeling Lucky
          </button>
        </div>
      </form>

      {/* Quick Shortcuts Row (6 items) */}
      <div className="zen-shortcuts-row" aria-label="Quick Access Shortcuts">
        {SHORTCUTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="zen-shortcut-item"
            onClick={() => navigateActiveTab(item.url)}
            title={`Open ${item.name}`}
          >
            <div
              className="zen-shortcut-circle"
              style={{ backgroundColor: item.bg }}
            >
              {item.renderIcon()}
            </div>
            <span className="zen-shortcut-label">{item.name}</span>
          </button>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
      />
    </div>
  );
};

export default ZenCenter;
