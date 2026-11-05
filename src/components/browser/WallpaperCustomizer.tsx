import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  X,
  RotateCcw,
  Check,
  Upload,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import {
  useWallpaperStore,
  WALLPAPER_PRESETS,
} from '../../store/useWallpaperStore';
import './WallpaperCustomizer.css';

export const WallpaperCustomizer: React.FC = () => {
  const {
    activePresetId,
    blur,
    opacity,
    isPanelOpen,
    setPreset,
    setCustomImage,
    setBlur,
    setOpacity,
    togglePanel,
    resetDefault,
  } = useWallpaperStore();

  const [activeCategory, setActiveCategory] = useState<'photos' | 'gradients' | 'solids'>('photos');
  const [customInput, setCustomInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isPanelOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        togglePanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen, togglePanel]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setCustomImage(customInput.trim(), true);
    setCustomInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomImage(dataUrl, true);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting same file still fires
    e.target.value = '';
  };

  const photoPresets = WALLPAPER_PRESETS.filter((p) => p.type === 'image');
  const gradientPresets = WALLPAPER_PRESETS.filter((p) => p.type === 'gradient');
  const solidPresets = WALLPAPER_PRESETS.filter((p) => p.type === 'solid');

  const currentPresets =
    activeCategory === 'photos'
      ? photoPresets
      : activeCategory === 'gradients'
      ? gradientPresets
      : solidPresets;

  return (
    <div className="wallpaper-customizer-container">
      {/* Floating Bottom-Right Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`wallpaper-trigger-btn ${isPanelOpen ? 'is-active' : ''}`}
        onClick={() => togglePanel()}
        title="Customize Canvas Wallpaper"
        aria-label="Customize Canvas Wallpaper"
      >
        <Palette size={15} strokeWidth={2.2} className="wallpaper-trigger-icon" />
        <span className="wallpaper-trigger-label">Wallpaper</span>
      </button>

      {/* Ultra-Premium Obsidian Glass Popover Panel */}
      {isPanelOpen && (
        <div
          ref={panelRef}
          className="wallpaper-panel"
          role="dialog"
          aria-label="Canvas Appearance Settings"
        >
          {/* Header */}
          <div className="wallpaper-panel-header">
            <div className="wallpaper-title-group">
              <span className="wallpaper-header-glyph">
                <Sparkles size={14} />
              </span>
              <h3 className="wallpaper-panel-title">Canvas Wallpaper</h3>
            </div>

            <div className="wallpaper-header-actions">
              <button
                type="button"
                className="wallpaper-header-tool-btn"
                onClick={resetDefault}
                title="Reset to default white"
                aria-label="Reset default"
              >
                <RotateCcw size={13} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                className="wallpaper-header-tool-btn"
                onClick={() => togglePanel(false)}
                title="Close customizer"
                aria-label="Close"
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Segmented Category Switcher */}
          <div className="wallpaper-segment-control" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'photos'}
              className={`wallpaper-segment-btn ${activeCategory === 'photos' ? 'is-active' : ''}`}
              onClick={() => setActiveCategory('photos')}
            >
              Photos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'gradients'}
              className={`wallpaper-segment-btn ${activeCategory === 'gradients' ? 'is-active' : ''}`}
              onClick={() => setActiveCategory('gradients')}
            >
              Gradients
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'solids'}
              className={`wallpaper-segment-btn ${activeCategory === 'solids' ? 'is-active' : ''}`}
              onClick={() => setActiveCategory('solids')}
            >
              Solids
            </button>
          </div>

          {/* Presets Grid (Scrollable) */}
          <div className="wallpaper-presets-scrollable">
            <div className="wallpaper-presets-grid">
              {currentPresets.map((preset) => {
                const isSelected = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`wallpaper-preset-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setPreset(preset)}
                    title={preset.name}
                  >
                    <div
                      className="wallpaper-thumb-preview"
                      style={{
                        background:
                          preset.type === 'solid'
                            ? preset.value
                            : preset.type === 'gradient'
                            ? preset.value
                            : `#1e1e24 url(${preset.thumbnail}) center / cover no-repeat`,
                      }}
                    >
                      {isSelected && (
                        <div className="wallpaper-selected-badge" aria-label="Selected">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="wallpaper-preset-name">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Docked Bottom Controls (Upload, URL, Sliders) */}
          <div className="wallpaper-panel-footer">
            {/* Custom Upload & URL Actions */}
            <div className="wallpaper-custom-actions-bar">
              <button
                type="button"
                className="wallpaper-action-chip"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image from computer"
              >
                <Upload size={13} strokeWidth={2.2} />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                className={`wallpaper-action-chip ${showUrlInput ? 'is-active' : ''}`}
                onClick={() => setShowUrlInput(!showUrlInput)}
                title="Enter web image URL"
              >
                <LinkIcon size={13} strokeWidth={2.2} />
                <span>Custom URL</span>
              </button>
            </div>

            {/* Expandable Custom URL Form */}
            {showUrlInput && (
              <form onSubmit={handleCustomSubmit} className="wallpaper-custom-url-form">
                <input
                  type="url"
                  className="wallpaper-url-input"
                  placeholder="Paste direct image URL..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="wallpaper-url-apply-btn">
                  Apply
                </button>
              </form>
            )}

            {/* Fine-Tuning Sliders Section (High Contrast) */}
            <div className="wallpaper-tuning-section">
              <div className="wallpaper-slider-group">
                <div className="wallpaper-slider-header">
                  <span className="wallpaper-slider-label">Background Blur</span>
                  <span className="wallpaper-slider-badge">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="wallpaper-custom-slider"
                  aria-label="Background Blur"
                />
              </div>

              <div className="wallpaper-slider-group">
                <div className="wallpaper-slider-header">
                  <span className="wallpaper-slider-label">Overlay Brightness</span>
                  <span className="wallpaper-slider-badge">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="wallpaper-custom-slider"
                  aria-label="Overlay Brightness"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default WallpaperCustomizer;
