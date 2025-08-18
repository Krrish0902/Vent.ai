import { ref, set, get, update, remove, onValue, off } from 'firebase/database';
import { db } from './firebase';
import { RoomMessage } from '../types/messages';

export interface SimpleRoomData {
  hostId: string;
  guestId?: string;
  hostName?: string;
  guestName?: string;
  hostReady: boolean;
  guestReady: boolean;
  aiInProgress: boolean;
  sessionEnded?: boolean;
  endedBy?: 'host' | 'guest';
  endedAt?: number;
  messages: RoomMessage[];
  lastUpdated: number;
}

class SimpleRoomService {
  private listeners: { [key: string]: () => void } = {};

  // Create a new room
  async createRoom(roomId: string, hostId: string, hostName?: string): Promise<void> {
    const roomData: SimpleRoomData = {
      hostId,
      hostName,
      hostReady: false,
      guestReady: false,
      aiInProgress: false,
      sessionEnded: false,
      messages: [],
      lastUpdated: Date.now()
    };

    await set(ref(db, `rooms/${roomId}`), roomData);
  }

  // Get room data
  async getRoom(roomId: string): Promise<SimpleRoomData | null> {
    try {
      const snapshot = await get(ref(db, `rooms/${roomId}`));
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        // Ensure messages is always an array
        return {
          ...roomData,
          messages: roomData.messages || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  // Join room as guest
  async joinRoom(roomId: string, guestId: string, guestName?: string): Promise<boolean> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) return false;

      await update(ref(db, `rooms/${roomId}`), {
        guestId,
        guestName,
        lastUpdated: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      return false;
    }
  }

  // Mark session as ended (used to notify the other participant)
  async markSessionEnded(roomId: string, endedBy: 'host' | 'guest'): Promise<void> {
    await update(ref(db, `rooms/${roomId}`), {
      sessionEnded: true,
      endedBy,
      endedAt: Date.now(),
      lastUpdated: Date.now()
    });
  }

  // Update ready status
  async updateReadyStatus(roomId: string, isHost: boolean, isReady: boolean): Promise<void> {
    const field = isHost ? 'hostReady' : 'guestReady';
    await update(ref(db, `rooms/${roomId}`), {
      [field]: isReady,
      lastUpdated: Date.now()
    });
  }

  // Add message to room
  async addMessage(roomId: string, message: RoomMessage): Promise<void> {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        console.error('Room not found when trying to add message:', roomId);
        return;
      }

      const updatedMessages = [...(room.messages || []), message];
      await update(ref(db, `rooms/${roomId}`), {
        messages: updatedMessages,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error adding message to room:', error);
      throw error;
    }
  }

  // Set AI in progress
  async setAIInProgress(roomId: string, inProgress: boolean): Promise<void> {
    await update(ref(db, `rooms/${roomId}`), {
      aiInProgress: inProgress,
      lastUpdated: Date.now()
    });
  }

  // Reset ready states (after AI call)
  async resetReadyStates(roomId: string): Promise<void> {
    await update(ref(db, `rooms/${roomId}`), {
      hostReady: false,
      guestReady: false,
      aiInProgress: false,
      lastUpdated: Date.now()
    });
  }

  // Delete room
  async deleteRoom(roomId: string): Promise<void> {
    await remove(ref(db, `rooms/${roomId}`));
  }

  // Listen to room changes (simple, no complex filtering)
  listenToRoom(roomId: string, callback: (room: SimpleRoomData | null) => void): () => void {
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      
      const unsubscribe = onValue(roomRef, (snapshot) => {
        try {
          const room = snapshot.exists() ? snapshot.val() : null;
          callback(room);
        } catch (error) {
          console.error('Error in room listener callback:', error);
        }
      }, (error) => {
        console.error('Firebase listener error:', error);
      });

      // Store listener for cleanup
      this.listeners[roomId] = unsubscribe;
      
      // Return cleanup function
      return () => {
        try {
          unsubscribe();
          delete this.listeners[roomId];
        } catch (error) {
          console.error('Error cleaning up listener:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up room listener:', error);
      // Return a no-op cleanup function
      return () => {};
    }
  }

  // Cleanup all listeners
  cleanup(): void {
    Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
    this.listeners = {};
  }
}

export const simpleRoomService = new SimpleRoomService();
