import Dexie, { Table } from 'dexie';
import { Thread } from '../types/thread';
import { Message, MessageDraft } from '../types/message';
import { AppSettings } from '../types/settings';

export class RileyDatabase extends Dexie {
  threads!: Table<Thread>;
  messages!: Table<Message>;
  settings!: Table<AppSettings>;
  drafts!: Table<MessageDraft>;
  rooms!: Table<any>;

  constructor() {
    super('VentDB');
    
    this.version(2).stores({
      threads: 'id, title, createdAt, updatedAt, isArchived, isPinned',
      messages: 'id, threadId, sender, timestamp, status',
      settings: 'id',
      drafts: 'threadId, lastSaved',
      rooms: 'id, hostId, guestId, createdAt, updatedAt, status'
    });
  }
}

export const db = new RileyDatabase();