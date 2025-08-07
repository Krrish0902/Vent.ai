import { create } from 'zustand';
import { AppSettings, ApiKeyConfig, UserPreferences } from '../types/settings';
import { db } from '../services/database';
import { encryptData, generateSecureId } from '../services/encryption';

interface SettingsStore {
  settings: AppSettings | null;
  isLoading: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  addApiKey: (provider: 'openai' | 'anthropic', name: string, key: string) => Promise<void>;
  updateApiKey: (id: string, updates: Partial<ApiKeyConfig>) => Promise<void>;
  deleteApiKey: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  getActiveApiKey: () => ApiKeyConfig | null;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  autoSave: true,
  soundEnabled: true,
  compactMode: false,
  showTypingIndicators: true,
  maxTokensPerMessage: 1000,
  aiModel: 'gpt-4',
  aiName: 'Riley'
};

const defaultSettings: AppSettings = {
  apiKeys: [],
  preferences: defaultPreferences,
  privacy: {
    dataRetentionDays: 365,
    autoDeleteEnabled: false,
    analyticsEnabled: false
  }
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      let settings = await db.settings.get('main');
      if (!settings) {
        settings = { ...defaultSettings, id: 'main' };
        await db.settings.add(settings);
      }
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ settings: { ...defaultSettings, id: 'main' }, isLoading: false });
    }
  },

  addApiKey: async (provider, name, key) => {
    const { settings } = get();
    if (!settings) return;

    const apiKey: ApiKeyConfig = {
      id: generateSecureId(),
      provider,
      name,
      key: encryptData(key),
      isActive: settings.apiKeys.length === 0,
      createdAt: new Date(),
      usage: {
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0
      }
    };

    const updatedSettings = {
      ...settings,
      apiKeys: [...settings.apiKeys, apiKey]
    };

    await db.settings.update('main', updatedSettings);
    set({ settings: updatedSettings });
  },

  updateApiKey: async (id, updates) => {
    const { settings } = get();
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      apiKeys: settings.apiKeys.map(key =>
        key.id === id ? { ...key, ...updates } : key
      )
    };

    await db.settings.update('main', updatedSettings);
    set({ settings: updatedSettings });
  },

  deleteApiKey: async (id) => {
    const { settings } = get();
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      apiKeys: settings.apiKeys.filter(key => key.id !== id)
    };

    await db.settings.update('main', updatedSettings);
    set({ settings: updatedSettings });
  },

  updatePreferences: async (preferences) => {
    const { settings } = get();
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      preferences: { ...settings.preferences, ...preferences }
    };

    await db.settings.update('main', updatedSettings);
    set({ settings: updatedSettings });
  },

  getActiveApiKey: () => {
    const { settings } = get();
    return settings?.apiKeys.find(key => key.isActive) || null;
  }
}));