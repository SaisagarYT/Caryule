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
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path
          fill="#ffffff"
          d="M9.8 8.16c0-.9 1-.95 1.55-.54l5.3 3.84c.6.43.6 1.35 0 1.78l-5.3 3.84c-.55.4-1.55.35-1.55-.54V8.16z"
        />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    bg: '#181717',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    bg: '#ffffff',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#111827">
        <path d="M12.09 13.124l-2.003 5.485c-.12.33-.27.555-.45.675-.18.12-.435.18-.765.18-.45 0-.855-.135-1.215-.405a3.83 3.83 0 01-.945-1.08L2.01 5.918c-.21-.42-.315-.765-.315-1.035 0-.27.09-.48.27-.63.18-.15.42-.225.72-.225.42 0 .765.135 1.035.405.27.27.465.645.585 1.125l3.555 9.72 2.115-5.805-1.53-4.23c-.18-.45-.27-.795-.27-1.035 0-.27.09-.48.27-.63.18-.15.42-.225.72-.225.39 0 .72.135.99.405.27.27.465.645.585 1.125l1.35 3.735 1.44-3.735c.12-.48.315-.855.585-1.125.27-.27.6-.405.99-.405.3 0 .54.075.72.225.18.15.27.36.27.63 0 .24-.09.585-.27 1.035l-1.575 4.23 2.16 5.805 3.555-9.72c.12-.48.315-.855.585-1.125.27-.27.615-.405 1.035-.405.3 0 .54.075.72.225.18.15.27.36.27.63 0 .27-.105.615-.315 1.035l-4.702 12.066a3.83 3.83 0 01-.945 1.08c-.36.27-.765.405-1.215.405-.33 0-.585-.06-.765-.18-.18-.12-.33-.345-.45-.675l-2.003-5.485z" />
      </svg>
    ),
  },
  {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://www.reddit.com',
    bg: '#ff4500',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    bg: '#10a37f',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#ffffff">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.783a4.485 4.485 0 0 1 2.366-1.973V12.4a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.784zm16.598 3.855l-5.843-3.37 2.019-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.674 8.105v-5.682a.79.79 0 0 0-.403-.676zm2.019-4.545l-.141-.085-4.78-2.759a.776.776 0 0 0-.784 0L9.41 8.618V6.286a.076.076 0 0 1 .033-.061l4.84-2.795a4.504 4.504 0 0 1 6.675 4.695v.003zm-10.42 4.148l2.463-1.423 2.463 1.423v2.843l-2.463 1.422-2.463-1.422z" />
      </svg>
    ),
  },
  {
    id: 'x',
    name: 'X / Twitter',
    url: 'https://x.com',
    bg: '#000000',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
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
