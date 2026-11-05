import React, { useState } from 'react';
import { Columns2, RotateCw } from 'lucide-react';
import './MultiBrowserPage.css';

export const MultiBrowserPage: React.FC = () => {
  const [panes] = useState([
    {
      id: 'pane-1',
      url: 'https://github.com',
      title: 'GitHub',
    },
    {
      id: 'pane-2',
      url: 'https://google.com',
      title: 'Google',
    },
  ]);

  const [activePaneId, setActivePaneId] = useState('pane-1');

  return (
    <div className="multi-browser-container">
      <div className="multi-header-bar">
        <div className="flex items-center gap-2">
          <Columns2 size={16} className="text-zinc-600" />
          <span className="font-semibold text-sm text-zinc-800">Multitasking Split View</span>
        </div>
      </div>

      <div className="multi-panes-stage">
        {panes.map((pane) => {
          const isActive = activePaneId === pane.id;
          return (
            <div
              key={pane.id}
              className={`multi-pane-frame ${isActive ? 'is-active' : ''}`}
              onClick={() => setActivePaneId(pane.id)}
            >
              <div className="multi-pane-top-bar">
                <span className="multi-pane-url-text">{pane.url}</span>
                <button type="button" className="multi-pane-tool-btn" title="Reload">
                  <RotateCw size={12} />
                </button>
              </div>

              <div className="multi-pane-body">
                <iframe
                  src={pane.url}
                  className="w-full h-full border-none"
                  title={pane.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiBrowserPage;
