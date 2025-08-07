import { create } from 'zustand';
import { Message, MessageStatus, TypingStatus } from '../types/message';
import { db } from '../services/database';
import { generateSecureId } from '../services/encryption';

interface MessageStore {
  messagesByThread: Record<string, Message[]>;
  isLoading: boolean;
  typingStatus: TypingStatus;
  
  // Actions
  loadMessages: (threadId: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<string>;
  updateMessageStatus: (id: string, status: MessageStatus) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  getThreadMessages: (threadId: string) => Message[];
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messagesByThread: {},
  isLoading: false,
  typingStatus: { isTyping: false },

  loadMessages: async (threadId) => {
    set({ isLoading: true });
    try {
      const messages = await db.messages
        .where('threadId')
        .equals(threadId)
        .sortBy('timestamp');
      
      set(state => ({
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: messages
        },
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ isLoading: false });
    }
  },

  addMessage: async (messageData) => {
    const message: Message = {
      ...messageData,
      id: generateSecureId(),
      timestamp: new Date(),
    };

    await db.messages.add(message);
    
    set(state => ({
      messagesByThread: {
        ...state.messagesByThread,
        [message.threadId]: [
          ...(state.messagesByThread[message.threadId] || []),
          message
        ]
      }
    }));

    return message.id;
  },

  updateMessageStatus: async (id, status) => {
    await db.messages.update(id, { status });
    
    set(state => {
      const updatedMessagesByThread = { ...state.messagesByThread };
      
      Object.keys(updatedMessagesByThread).forEach(threadId => {
        updatedMessagesByThread[threadId] = updatedMessagesByThread[threadId].map(msg =>
          msg.id === id ? { ...msg, status } : msg
        );
      });
      
      return { messagesByThread: updatedMessagesByThread };
    });
  },

  deleteMessage: async (id) => {
    await db.messages.delete(id);
    
    set(state => {
      const updatedMessagesByThread = { ...state.messagesByThread };
      
      Object.keys(updatedMessagesByThread).forEach(threadId => {
        updatedMessagesByThread[threadId] = updatedMessagesByThread[threadId].filter(
          msg => msg.id !== id
        );
      });
      
      return { messagesByThread: updatedMessagesByThread };
    });
  },

  setTyping: (isTyping) => {
    set({
      typingStatus: {
        isTyping,
        startedAt: isTyping ? new Date() : undefined
      }
    });
  },

  getThreadMessages: (threadId) => {
    return get().messagesByThread[threadId] || [];
  }
}));