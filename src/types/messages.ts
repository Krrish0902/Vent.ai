export interface RoomMessage {
  id: string;
  type: 'chat' | 'ai';
  sender: 'host' | 'guest' | 'ai';
  content: string;
  timestamp: Date;
}


