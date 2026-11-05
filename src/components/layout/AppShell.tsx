import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { BrowserViewport } from '../browser/BrowserViewport';
import './AppShell.css';

export interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell" aria-label="Desktop Browser Application">
      <Sidebar />
      <BrowserViewport>
        {children}
      </BrowserViewport>
    </div>
  );
};

export default AppShell;

