import React from 'react';
import { User, Shield, Moon } from 'lucide-react';
import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page-container">
      <div className="profile-page-scrollable">
        <div className="profile-page-inner">
          <div className="profile-user-card">
            <div className="profile-avatar-circle">
              <span className="profile-avatar-initials">SS</span>
            </div>
            <div className="profile-user-info">
              <h2 className="profile-user-name">Sai Sankar</h2>
              <p className="profile-user-email">saisankar@carule.ai</p>
            </div>
          </div>

          <div className="profile-setting-card">
            <div className="profile-card-header">
              <Shield size={16} className="text-zinc-600" />
              <h3 className="profile-card-title">Browser Preferences</h3>
            </div>
            <div className="profile-field-group">
              <label className="profile-field-label">Default Search Engine</label>
              <select className="p-2 border border-zinc-200 rounded-lg text-xs outline-none bg-white">
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
