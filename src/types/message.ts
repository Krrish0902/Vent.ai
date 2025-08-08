export interface Message {
  id: string;
  threadId: string;
  content: string;
  sender: 'user' | 'Krrish';
  timestamp: Date;
  status: MessageStatus;
  tokens?: number;
  isEdited?: boolean;
  editedAt?: Date;
  reaction?: string; // Emoji reaction from AI
}

export type MessageStatus = 'sending' | 'sent' | 'failed' | 'delivered';

export type ConversationMode = 'venting' | 'perspective' | 'general';

export interface TypingStatus {
  isTyping: boolean;
  startedAt?: Date;
}

export interface MessageDraft {
  threadId: string;
  content: string;
  lastSaved: Date;
}