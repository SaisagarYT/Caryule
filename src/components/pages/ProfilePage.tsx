import React from 'react';
import { Shield, Moon, Sun, Check, Sparkles } from 'lucide-react';
import { useBrowserStore } from '../../store/useBrowserStore';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { theme, setTheme } = useBrowserStore();

  return (
    <div className="profile-page-container">
      <div className="profile-page-scrollable">
        <div className="profile-page-inner">
          <div className="profile-user-card">
            <div className="profile-avatar-circle">
              <span className="profile-avatar-initials">SS</span>
              <span className="profile-online-badge" />
            </div>
            <div className="profile-user-info">
              <div className="flex items-center gap-2">
                <h2 className="profile-user-name">Sai Sankar</h2>
                <span className="profile-tier-badge">Pro Agentic</span>
              </div>
              <p className="profile-user-email">saisankar@carule.ai</p>
            </div>
          </div>

          {/* Theme & Appearance Card */}
          <div className="profile-setting-card">
            <div className="profile-card-header">
              <Sparkles size={16} />
              <h3 className="profile-card-title">Appearance & Theme</h3>
            </div>
            <div className="profile-field-group">
              <label className="profile-field-label">Interface Mode</label>
              <div className="profile-theme-grid">
                <button
                  type="button"
                  className={`profile-theme-card ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <div className="profile-theme-card-top">
                    <Moon size={16} />
                    <span className="profile-theme-card-title">Dark Mode</span>
                    {theme === 'dark' && <Check size={14} className="ml-auto text-emerald-400" />}
                  </div>
                  <p className="profile-theme-card-desc">Lifted graphite surfaces with subtle tactile borders and low eye-strain.</p>
                </button>

                <button
                  type="button"
                  className={`profile-theme-card ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <div className="profile-theme-card-top">
                    <Sun size={16} />
                    <span className="profile-theme-card-title">Light Mode</span>
                    {theme === 'light' && <Check size={14} className="ml-auto text-emerald-600" />}
                  </div>
                  <p className="profile-theme-card-desc">Luminous, high-contrast Swiss-grid surfaces for daytime productivity.</p>
                </button>
              </div>
            </div>
          </div>

          <div className="profile-setting-card">
            <div className="profile-card-header">
              <Shield size={16} />
              <h3 className="profile-card-title">Browser Preferences</h3>
            </div>
            <div className="profile-field-group">
              <label className="profile-field-label">Default Search Engine</label>
              <select className="profile-select-control">
                <option>Google</option>
                <option>DuckDuckGo</option>
                <option>Bing</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
