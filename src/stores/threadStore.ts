import { create } from 'zustand';
import { Thread } from '../types/thread';
import { db } from '../services/database';
import { generateSecureId } from '../services/encryption';
import { format } from 'date-fns';
import type { ConversationMode } from '../types/message';

interface ThreadStore {
  threads: Thread[];
  currentThreadId: string | null;
  isLoading: boolean;
  searchQuery: string;
  
  // Actions
  loadThreads: () => Promise<void>;
  createThread: (mode?: ConversationMode) => Promise<string>;
  updateThread: (id: string, updates: Partial<Thread>) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  setCurrentThread: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredThreads: () => Thread[];
}

export const useThreadStore = create<ThreadStore>((set, get) => ({
  threads: [],
  currentThreadId: null,
  isLoading: false,
  searchQuery: '',

  loadThreads: async () => {
    set({ isLoading: true });
    try {
      const threads = await db.threads.orderBy('updatedAt').reverse().toArray();
      set({ threads, isLoading: false });
    } catch (error) {
      console.error('Error loading threads:', error);
      set({ isLoading: false });
    }
  },

  createThread: async (mode: ConversationMode = 'general') => {
    const now = new Date();
    const formattedDate = format(now, 'dd MMM HH:mm');
    const title = `${mode.charAt(0).toUpperCase() + mode.slice(1)} ${formattedDate}`;

    const newThread: Thread = {
      id: generateSecureId(),
      title,
      createdAt: now,
      updatedAt: now,
      messageCount: 0,
      totalTokens: 0,
      isArchived: false,
      isPinned: false,
      mode
    };

    await db.threads.add(newThread);
    set(state => ({
      threads: [newThread, ...state.threads]
    }));

    return newThread.id;
  },

  updateThread: async (id, updates) => {
    await db.threads.update(id, { ...updates, updatedAt: new Date() });
    set(state => ({
      threads: state.threads.map(thread => 
        thread.id === id 
          ? { ...thread, ...updates, updatedAt: new Date() }
          : thread
      )
    }));
  },

  deleteThread: async (id) => {
    await db.threads.delete(id);
    await db.messages.where('threadId').equals(id).delete();
    
    set(state => ({
      threads: state.threads.filter(thread => thread.id !== id),
      currentThreadId: state.currentThreadId === id ? null : state.currentThreadId
    }));
  },

  setCurrentThread: (id) => {
    set({ currentThreadId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredThreads: () => {
    const { threads, searchQuery } = get();
    if (!searchQuery) return threads;
    
    return threads.filter(thread =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessagePreview?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
}));