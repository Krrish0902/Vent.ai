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
  generateConversationSummary: (messages: RoomMessage[], hostName?: string, guestName?: string) => Promise<string>;
  
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
      
      // Get AI name from settings
      const settingsState = useSettingsStore.getState();
      const aiName = settingsState.settings?.preferences.aiName || 'Krrish';
      const model = settingsState.settings?.preferences.aiModel || 'gemini-1.5-flash';

      // Create Gemini service instance - API key should be decrypted by the service
      const geminiService = new GeminiService(apiKey, 'Krrish', 'Couple', true);

      // Build conversation context from room messages
      const conversationContext = messages
        .filter(msg => msg.type === 'chat')
        .map(msg => `${msg.sender === 'host' ? (hostName || 'Host') : (guestName || 'Guest')}: ${msg.content}`)
        .join('\n');

      console.log('Conversation context being sent to AI:', conversationContext);
      console.log('Total messages in room:', messages.length);
      console.log('Chat messages found:', messages.filter(msg => msg.type === 'chat').length);

      // Generate running summary of the conversation
      const runningSummary = await get().generateConversationSummary(messages, hostName, guestName);

      // Create couple-specific prompt with rolling memory
      const couplePrompt = `${aiName} — the trusted third wheel/best friend in a couple's group chat. You're warm, real, and on the side of "you two as a team." This is an ongoing conversation (not a one-off). Stay consistent, remember context, and follow up naturally.

YOUR JOB

Listen first; reflect what both partners are feeling.

Keep the thread's memory: recall earlier points, agreements, and themes.

Offer gentle perspective and tiny, practical next steps — only when it helps.

Stay casual and human. You're a friend, not a therapist.

CONTEXT YOU'LL RECEIVE

A rolling transcript of this room with messages from Partner A, Partner B, and you (${aiName}).

You may see recent slices plus a compact summary of prior turns.

HOW TO RESPOND (DYNAMIC)

If someone is venting or emotional:

Validate briefly and sincerely.

Ask 1 caring, clarifying question.

Hold off on advice unless they ask or it's clearly helpful.

If they asked for take/advice:

Offer 1–3 small, concrete suggestions (scripts, rituals, a tiny experiment).

Keep it doable within a day/week.

If they made progress or tried something:

Acknowledge it. Reinforce the win.

Offer a tiny next step or a reflective question to deepen understanding.

If they're stuck/repeating a loop:

Gently name the pattern (never shamey).

Suggest a small reset and a script to try.

MEMORY & CONTINUITY

Refer back to earlier facts ("last time you said…", "earlier you both agreed…").

Track themes: feeling unheard, timing, tone, repair attempts, expectations.

Keep names/pronouns consistent if provided.

TONE

Warm, human, concise. Casual language ok: "oof," "that sounds rough," "from the outside…"

Never clinical, never judgey, never take sides.

A little humor only if it lightens the moment appropriately.

Emojis: light touch only when it adds warmth (✨🤝💬).

BOUNDARIES

No medical/legal advice. If harm or abuse is hinted, suggest talking to a trusted person or professional.

You're a supportive friend. Focus on communication, curiosity, and assuming good intent.

OUTPUT SHAPE (adaptive, keep it short)

What I'm hearing: 1–2 lines reflecting both sides.

Follow-up: 1 caring question OR 1–2 specific suggestions (if asked/appropriate).

Nudge: a tiny, practical next step (optional).

Encouragement: 1 short line with warm energy (1 emoji max).

If you reference the past, be precise but brief.

Keep replies ~3–6 short paragraphs max. Avoid bullet lists unless it improves clarity for suggestions.

RUNNING SUMMARY (for context memory):
${runningSummary}

RECENT MESSAGES (newest last):
${conversationContext}

Respond as ${aiName} now. Remember: keep it warm, brief, and context-aware. Avoid rehashing what's obvious; add value with reflection, follow-ups, and tiny next steps.`;


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
      ], model, 'perspective');

      console.log('Full API response:', response);
      console.log('Response content type:', typeof response.content);
      console.log('Response content length:', response.content?.length || 0);

      // Extract meaningful response, filtering out structural parts
      let cleanedContent = response.content;
      
      console.log('Raw AI response:', cleanedContent);
      
      // Only clean if the content follows the expected format
      if (cleanedContent && cleanedContent.trim()) {
        // Remove section labels but keep their content - be more conservative
        cleanedContent = cleanedContent.replace(/^What I'm hearing:\s*/im, '');
        cleanedContent = cleanedContent.replace(/^Follow-up:\s*/im, '');
        cleanedContent = cleanedContent.replace(/^Nudge:\s*/im, '');
        cleanedContent = cleanedContent.replace(/^Encouragement:\s*/im, '');
        cleanedContent = cleanedContent.replace(/^You've got this:\s*/im, '');
        cleanedContent = cleanedContent.replace(/^A question to think about:\s*/im, '');
        cleanedContent = cleanedContent.replace(/^A few ideas to try:\s*/im, '');
        
        // Clean up any extra whitespace and empty lines
        cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
      }
      
      // Fallback: if cleaning resulted in empty content, use the original
      if (!cleanedContent || cleanedContent.trim() === '') {
        console.warn('Content cleaning resulted in empty response, using original');
        cleanedContent = response.content;
      }
      
      // Final fallback: if still empty, create a default response
      if (!cleanedContent || cleanedContent.trim() === '') {
        console.error('Both cleaned and original content are empty, creating default response');
        cleanedContent = "I'm here to help! I've been listening to your conversation and I'm ready to offer some perspective. What would you like to discuss or work through together?";
      }
      
      console.log('Final AI response content:', cleanedContent);
      console.log('Final content length:', cleanedContent.length);

      // Create AI response message
      const aiResponse: RoomMessage = {
        id: nanoid(),
        type: 'ai',
        sender: 'ai',
        content: cleanedContent,
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

  // Generate conversation summary
  generateConversationSummary: async (messages: RoomMessage[], hostName?: string, guestName?: string) => {
    const host = hostName || 'Host';
    const guest = guestName || 'Guest';
    
    if (messages.length === 0) {
      return `New conversation between ${host} and ${guest}. No messages yet.`;
    }

    const chatMessages = messages.filter(msg => msg.type === 'chat');
    if (chatMessages.length === 0) {
      return `Conversation between ${host} and ${guest}. No chat messages yet.`;
    }

    // Analyze conversation content
    const hostMessages = chatMessages.filter(msg => msg.sender === 'host');
    const guestMessages = chatMessages.filter(msg => msg.sender === 'guest');
    
    // Detect themes and patterns
    const allContent = chatMessages.map(msg => msg.content.toLowerCase());
    const themes = [];
    
    if (allContent.some(content => content.includes('angry') || content.includes('upset') || content.includes('frustrated'))) {
      themes.push('conflict resolution');
    }
    if (allContent.some(content => content.includes('communication') || content.includes('talk') || content.includes('discuss'))) {
      themes.push('communication improvement');
    }
    if (allContent.some(content => content.includes('love') || content.includes('care') || content.includes('appreciate'))) {
      themes.push('emotional connection');
    }
    if (allContent.some(content => content.includes('time') || content.includes('busy') || content.includes('schedule'))) {
      themes.push('time management');
    }
    if (allContent.some(content => content.includes('trust') || content.includes('jealous') || content.includes('insecurity'))) {
      themes.push('trust and security');
    }

    // Detect emotional tone
    let tone = 'neutral';
    if (allContent.some(content => content.includes('😊') || content.includes('happy') || content.includes('good'))) {
      tone = 'positive';
    } else if (allContent.some(content => content.includes('😔') || content.includes('sad') || content.includes('bad'))) {
      tone = 'negative';
    } else if (allContent.some(content => content.includes('😤') || content.includes('angry') || content.includes('frustrated'))) {
      tone = 'heated';
    }

    // Count messages to see engagement
    const totalMessages = chatMessages.length;
    const hostEngagement = hostMessages.length;
    const guestEngagement = guestMessages.length;

    const summary = [
      `Conversation between ${host} and ${guest}:`,
      `Total messages: ${totalMessages}`,
      `Engagement: ${host} (${hostEngagement}), ${guest} (${guestEngagement})`,
      `Themes: ${themes.length > 0 ? themes.join(', ') : 'general discussion'}`,
      `Tone: ${tone}`,
      `Recent focus: ${chatMessages.slice(-3).map(msg => `${msg.sender === 'host' ? host : guest}: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`).join(' | ')}`
    ];

    return summary.join('\n');
  },

  // Cleanup function
  _cleanup: () => {}
}));
