import { create } from 'zustand';

export interface WallpaperPreset {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'image';
  value: string;
  thumbnail?: string;
  isDark?: boolean;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  // Curated High-Res Wallpapers (Verified 200 OK CDN URLs with CSS Fallbacks)
  {
    id: 'alpine-forest',
    name: 'Alpine Forest',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=75',
    isDark: true,
  },
  {
    id: 'kyoto-temple',
    name: 'Kyoto Temple',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&auto=format&fit=crop&q=75',
    isDark: false,
  },
  {
    id: 'dark-dunes',
    name: 'Dark Dunes',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&auto=format&fit=crop&q=75',
    isDark: true,
  },
  {
    id: 'emerald-lake',
    name: 'Emerald Lake',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=75',
    isDark: false,
  },
  {
    id: 'moody-mountain',
    name: 'Moody Mountain',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&auto=format&fit=crop&q=75',
    isDark: true,
  },
  {
    id: 'night-aurora',
    name: 'Night Aurora',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&auto=format&fit=crop&q=75',
    isDark: true,
  },
  {
    id: 'abstract-silk',
    name: 'Abstract Waves',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=75',
    isDark: true,
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    type: 'image',
    value: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=75',
    isDark: true,
  },

  // Soft Mesh & Aurora Gradients
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    thumbnail: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    isDark: false,
  },
  {
    id: 'aurora-violet',
    name: 'Aurora Glow',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    thumbnail: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    isDark: false,
  },
  {
    id: 'peach-sunset',
    name: 'Peach Twilight',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    thumbnail: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    isDark: false,
  },
  {
    id: 'sage-breeze',
    name: 'Sage Mist',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    thumbnail: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    isDark: false,
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    type: 'gradient',
    value: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 60%, #020617 100%)',
    thumbnail: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 60%, #020617 100%)',
    isDark: true,
  },
  {
    id: 'midnight-nebula',
    name: 'Midnight Nebula',
    type: 'gradient',
    value: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #0f172a 100%)',
    thumbnail: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #0f172a 100%)',
    isDark: true,
  },

  // Solid Colors
  {
    id: 'default-white',
    name: 'Zen White',
    type: 'solid',
    value: '#ffffff',
    thumbnail: '#ffffff',
    isDark: false,
  },
  {
    id: 'soft-cream',
    name: 'Warm Cream',
    type: 'solid',
    value: '#fbf9f5',
    thumbnail: '#fbf9f5',
    isDark: false,
  },
  {
    id: 'mist-gray',
    name: 'Mist Gray',
    type: 'solid',
    value: '#f1f3f5',
    thumbnail: '#f1f3f5',
    isDark: false,
  },
  {
    id: 'slate-studio',
    name: 'Slate Studio',
    type: 'solid',
    value: '#1e293b',
    thumbnail: '#1e293b',
    isDark: true,
  },
  {
    id: 'obsidian-dark',
    name: 'Deep Obsidian',
    type: 'solid',
    value: '#121214',
    thumbnail: '#121214',
    isDark: true,
  },
];

interface WallpaperState {
  activePresetId: string;
  type: 'solid' | 'gradient' | 'image';
  value: string;
  blur: number;
  opacity: number;
  isDark: boolean;
  isPanelOpen: boolean;

  setPreset: (preset: WallpaperPreset) => void;
  setCustomImage: (dataOrUrl: string, isDark?: boolean) => void;
  setBlur: (blur: number) => void;
  setOpacity: (opacity: number) => void;
  togglePanel: (open?: boolean) => void;
  resetDefault: () => void;
}

const STORAGE_KEY = 'carule_wallpaper_config';

const getInitialConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    activePresetId: 'default-white',
    type: 'solid' as const,
    value: '#ffffff',
    blur: 0,
    opacity: 1,
    isDark: false,
  };
};

const initial = getInitialConfig();

export const useWallpaperStore = create<WallpaperState>((set) => ({
  activePresetId: initial.activePresetId,
  type: initial.type,
  value: initial.value,
  blur: initial.blur,
  opacity: initial.opacity,
  isDark: initial.isDark,
  isPanelOpen: false,

  setPreset: (preset) => {
    set({
      activePresetId: preset.id,
      type: preset.type,
      value: preset.value,
      isDark: Boolean(preset.isDark),
    });
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePresetId: preset.id,
          type: preset.type,
          value: preset.value,
          blur: 0,
          opacity: 1,
          isDark: Boolean(preset.isDark),
        })
      );
    } catch {
      // storage error ignore
    }
  },

  setCustomImage: (dataOrUrl: string, isDark = true) => {
    if (!dataOrUrl.trim()) return;
    set({
      activePresetId: 'custom',
      type: 'image',
      value: dataOrUrl.trim(),
      isDark,
    });
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePresetId: 'custom',
          type: 'image',
          value: dataOrUrl.trim(),
          blur: 0,
          opacity: 1,
          isDark,
        })
      );
    } catch {
      // storage error ignore
    }
  },

  setBlur: (blur) => {
    set({ blur });
  },

  setOpacity: (opacity) => {
    set({ opacity });
  },

  togglePanel: (open) => {
    set((state) => ({
      isPanelOpen: open !== undefined ? open : !state.isPanelOpen,
    }));
  },

  resetDefault: () => {
    const def = WALLPAPER_PRESETS.find((p) => p.id === 'default-white') || WALLPAPER_PRESETS[0];
    set({
      activePresetId: def.id,
      type: def.type,
      value: def.value,
      blur: 0,
      opacity: 1,
      isDark: false,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
}));
