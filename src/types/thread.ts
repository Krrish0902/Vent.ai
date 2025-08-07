export interface Thread {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  totalTokens: number;
  isArchived: boolean;
  isPinned: boolean;
  lastMessagePreview?: string;
  conversationSummary?: string;
}

export interface ThreadMetadata {
  id: string;
  title: string;
  lastActivity: Date;
  messageCount: number;
  totalTokens: number;
  emotionalTone?: 'positive' | 'neutral' | 'concerned' | 'supportive';
}

export interface ConversationStarter {
  id: string;
  title: string;
  description: string;
  category: 'communication' | 'conflict' | 'intimacy' | 'trust' | 'general';
  prompt: string;
}