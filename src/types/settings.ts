export interface ApiKeyConfig {
  id: string;
  provider: 'openai' | 'anthropic';
  name: string;
  key: string; // encrypted
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usage: {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
  showTypingIndicators: boolean;
  maxTokensPerMessage: number;
  aiModel: string;
  aiName: string; // Custom AI name preference
}

export interface AppSettings {
  apiKeys: ApiKeyConfig[];
  preferences: UserPreferences;
  privacy: {
    dataRetentionDays: number;
    autoDeleteEnabled: boolean;
    analyticsEnabled: boolean;
  };
}