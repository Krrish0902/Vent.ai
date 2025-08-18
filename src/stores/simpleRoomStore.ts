import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { RoomMessage } from '../types/messages';
import { simpleRoomService, SimpleRoomData } from '../services/simpleRoomService';
import { GeminiService } from '../services/gemini';
import { useSettingsStore } from './settingsStore';

interface SimpleRoomState {
  // Room state
  roomId: string | null;
  isHost: boolean;
  connectionStatus: 'disconnected' | 'connected';
  hostName?: string;
  guestName?: string;
  
  // Simple ready states
  hostReady: boolean;
  guestReady: boolean;
  aiInProgress: boolean;
  
  // Messages
  messages: RoomMessage[];
  
  // Actions
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  sendMessage: (content: string) => Promise<void>;
  setReadyStatus: (isReady: boolean) => Promise<void>;
  requestAIAdvice: (apiKey: string) => Promise<void>;
  resumeRoomFromStorage: () => Promise<boolean>;
  
  // Internal
  _cleanup: () => void;
}

export const useSimpleRoomStore = create<SimpleRoomState>((set, get) => ({
  // Initial state
  roomId: null,
  isHost: false,
  connectionStatus: 'disconnected',
  hostReady: false,
  guestReady: false,
  aiInProgress: false,
  messages: [],

  // Create room
  createRoom: async () => {
    const roomId = nanoid(8);
    const hostId = nanoid(8);
    const settingsState = useSettingsStore.getState();
    const hostName = settingsState.settings?.preferences.userName?.trim() || 'Host';
    
    // Create room in database
    await simpleRoomService.createRoom(roomId, hostId, hostName);
    
    // Set local state
    set({
      roomId,
      isHost: true,
      connectionStatus: 'connected',
      hostName,
      guestName: '',
      hostReady: false,
      guestReady: false,
      aiInProgress: false,
      messages: []
    });

    // Persist current room session
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lovelogic_current_room', JSON.stringify({ roomId, role: 'host' }));
      }
    } catch {}

    // Listen to room changes
    const unsubscribe = simpleRoomService.listenToRoom(roomId, (room) => {
      if (!room) {
        // Deleted remotely – as host, we've likely just ended it; ignore
        return;
      }
      if (room.sessionEnded) {
        try {
          if (typeof window !== 'undefined') {
            window.alert('Session ended' + (room.endedBy ? ` by ${room.endedBy}.` : '.'));
          }
        } catch {}
        get().leaveRoom();
        return;
      }
      set({
        hostName: room.hostName || hostName,
        guestName: room.guestName || '',
        hostReady: room.hostReady,
        guestReady: room.guestReady,
        aiInProgress: room.aiInProgress,
        messages: room.messages || []
      });
    });

    // Store cleanup function
    set({ _cleanup: unsubscribe });

    return roomId;
  },

  // Join room
  joinRoom: async (roomId: string) => {
    console.log('joinRoom called with roomId:', roomId);
    try {
      // Check if room exists
      const room = await simpleRoomService.getRoom(roomId);
      console.log('Room found:', room);
      if (!room) {
        console.log('Room not found, returning false');
        return false;
      }

      const guestId = nanoid(8);
      const settingsState = useSettingsStore.getState();
      const guestName = settingsState.settings?.preferences.userName?.trim() || 'Guest';
      console.log('Joining as guest:', { guestId, guestName });
      
      // Join room in database
      await simpleRoomService.joinRoom(roomId, guestId, guestName);
      console.log('Successfully joined room in database');
      
      // Set local state
      set({
        roomId,
        isHost: false,
        connectionStatus: 'connected',
        hostName: room.hostName || 'Host',
        guestName,
        hostReady: room.hostReady,
        guestReady: room.guestReady,
        aiInProgress: room.aiInProgress,
        messages: room.messages
      });
      console.log('Local state updated, roomId set to:', roomId);

      // Persist current room session
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('lovelogic_current_room', JSON.stringify({ roomId, role: 'guest' }));
          console.log('Room session persisted to localStorage');
        }
      } catch (error) {
        console.error('Failed to persist room session:', error);
      }

      // Listen to room changes
      const unsubscribe = simpleRoomService.listenToRoom(roomId, (room) => {
        console.log('Room update received:', room);
        if (!room) {
          // Room deleted by host – notify and leave
          try {
            if (typeof window !== 'undefined') {
              window.alert('The session was ended by the host.');
            }
          } catch {}
          get().leaveRoom();
          return;
        }
        if (room.sessionEnded) {
          try {
            if (typeof window !== 'undefined') {
              window.alert('The session was ended' + (room.endedBy ? ` by ${room.endedBy}.` : '.'));
            }
          } catch {}
          get().leaveRoom();
          return;
        }
        set({
          hostName: room.hostName || 'Host',
          guestName: room.guestName || guestName,
          hostReady: room.hostReady,
          guestReady: room.guestReady,
          aiInProgress: room.aiInProgress,
          messages: room.messages || []
        });
      });

      // Store cleanup function
      set({ _cleanup: unsubscribe });
      console.log('Room listener set up, returning true');

      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  },

  // Leave room
  leaveRoom: () => {
    const { roomId, isHost, _cleanup } = get();
    
    // Cleanup listener
    if (_cleanup) _cleanup();
    
    // If host, first mark session ended to notify guest, then delete after a short delay
    if (roomId && isHost) {
      simpleRoomService.markSessionEnded(roomId, 'host').catch(() => {});
      setTimeout(() => {
        simpleRoomService.deleteRoom(roomId!).catch(() => {});
      }, 500);
    }

    // Reset state
    set({
      roomId: null,
      isHost: false,
      connectionStatus: 'disconnected',
      hostReady: false,
      guestReady: false,
      aiInProgress: false,
      messages: [],
      _cleanup: () => {}
    });

    // Clear persisted session
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('lovelogic_current_room');
      }
    } catch {}
  },

  // Send message
  sendMessage: async (content: string) => {
    try {
      const { roomId, isHost } = get();
      if (!roomId) return;

      const message: RoomMessage = {
        id: nanoid(),
        type: 'chat',
        sender: isHost ? 'host' : 'guest',
        content,
        timestamp: new Date()
      };

      // Add message to database
      await simpleRoomService.addMessage(roomId, message);
      
      // Reset ready states when message is sent (but don't await to avoid blocking)
      const currentState = get();
      if (currentState.hostReady || currentState.guestReady) {
        // Use setTimeout to avoid blocking the UI
        setTimeout(() => {
          simpleRoomService.resetReadyStates(roomId).catch(console.error);
        }, 100);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Don't crash the app, just log the error
    }
  },

  // Set ready status
  setReadyStatus: async (isReady: boolean) => {
    const { roomId, isHost } = get();
    if (!roomId) return;

    // Update database
    await simpleRoomService.updateReadyStatus(roomId, isHost, isReady);
    
    // Reset AI progress if unready
    if (!isReady && get().aiInProgress) {
      await simpleRoomService.setAIInProgress(roomId, false);
    }
  },

  // Request AI advice
  requestAIAdvice: async (apiKey: string) => {
    const { roomId, isHost, hostReady, guestReady, messages, hostName, guestName } = get();
    if (!isHost || !roomId) return;

    // Check if both are ready
    if (!hostReady || !guestReady) return;

    // Set AI in progress
    await simpleRoomService.setAIInProgress(roomId, true);

    try {
      if (!apiKey) {
        throw new Error('No API key available. Please add your Gemini API key in settings.');
      }
      

      // Create Gemini service instance - API key should be decrypted by the service
      const geminiService = new GeminiService(apiKey, 'Krrish', 'Couple', true);

      // Build conversation context from room messages
      const conversationContext = messages
        .filter(msg => msg.type === 'chat')
        .map(msg => `${msg.sender === 'host' ? (hostName || 'Host') : (guestName || 'Guest')}: ${msg.content}`)
        .join('\n');

      // Create couple-specific prompt
      const couplePrompt = `You are Krrish, a wise and caring relationship advisor. A couple has shared their conversation with you and is seeking advice together.

CONVERSATION CONTEXT:
${conversationContext}

YOUR ROLE:
• You are speaking to BOTH partners together
• Offer balanced, thoughtful relationship advice
• Be supportive and non-judgmental
• Focus on communication, understanding, and growth
• Address both perspectives when possible

ADVICE APPROACH:
• Start with validation and understanding
• Offer specific, actionable suggestions
• Encourage open communication between partners
• Be encouraging and positive about their relationship
• Use warm, supportive language

RESPONSE FORMAT:
• Keep it conversational and friendly
• Offer 2-3 specific pieces of advice
• End with an encouraging note
• Use appropriate emojis to keep it warm

Remember: You're helping two people who care about each other and want to improve their relationship. Be the supportive friend who helps them see each other's perspectives and grow together.`;

      // Send to Gemini API
      const response = await geminiService.sendMessage([
        {
          id: nanoid(),
          threadId: roomId,
          sender: 'user',
          content: couplePrompt,
          timestamp: new Date(),
          status: 'sent'
        }
      ], 'gemini-1.5-flash', 'perspective');

      // Create AI response message
      const aiResponse: RoomMessage = {
        id: nanoid(),
        type: 'ai',
        sender: 'ai',
        content: response.content,
        timestamp: new Date()
      };

      // Add AI message to database
      await simpleRoomService.addMessage(roomId, aiResponse);
      
      // Reset ready states
      await simpleRoomService.resetReadyStates(roomId);
    } catch (error) {
      console.error('Error requesting AI advice:', error);
      
      // Send error message to room
      const errorMessage: RoomMessage = {
        id: nanoid(),
        type: 'ai',
        sender: 'ai',
        content: `Sorry, I couldn't provide advice right now. ${error instanceof Error ? error.message : 'Please try again later.'}`,
        timestamp: new Date()
      };
      
      console.log('Created error message:', errorMessage);
      
      await simpleRoomService.addMessage(roomId, errorMessage);
      await simpleRoomService.setAIInProgress(roomId, false);
    }
  },

  // Resume room session from local storage on app load/refresh
  resumeRoomFromStorage: async () => {
    try {
      if (get().roomId) return true; // already in a room
      if (typeof window === 'undefined') return false;
      const persisted = window.localStorage.getItem('lovelogic_current_room');
      if (!persisted) return false;
      const { roomId, role } = JSON.parse(persisted || '{}') as { roomId?: string; role?: 'host' | 'guest' };
      if (!roomId || !role) return false;

      const existing = await simpleRoomService.getRoom(roomId);
      if (!existing || existing.sessionEnded) {
        window.localStorage.removeItem('lovelogic_current_room');
        return false;
      }

      if (role === 'host') {
        // Rehydrate as host
        set({
          roomId,
          isHost: true,
          connectionStatus: 'connected',
          hostName: existing.hostName || 'Host',
          guestName: existing.guestName || '',
          hostReady: existing.hostReady,
          guestReady: existing.guestReady,
          aiInProgress: existing.aiInProgress,
          messages: existing.messages || []
        });

        const unsubscribe = simpleRoomService.listenToRoom(roomId, (room) => {
          if (!room || room.sessionEnded) {
            get().leaveRoom();
            return;
          }
          set({
            hostName: room.hostName || 'Host',
            guestName: room.guestName || '',
            hostReady: room.hostReady,
            guestReady: room.guestReady,
            aiInProgress: room.aiInProgress,
            messages: room.messages || []
          });
        });
        set({ _cleanup: unsubscribe });
        return true;
      } else {
        // Re-join as guest (generates a fresh guestId)
        return await get().joinRoom(roomId);
      }
    } catch (e) {
      return false;
    }
  },

  // Cleanup function
  _cleanup: () => {}
}));
