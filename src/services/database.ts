import Dexie, { Table } from 'dexie';
import { Thread } from '../types/thread';
import { Message, MessageDraft } from '../types/message';
import { AppSettings } from '../types/settings';

export class RileyDatabase extends Dexie {
  threads!: Table<Thread>;
  messages!: Table<Message>;
  settings!: Table<AppSettings>;
  drafts!: Table<MessageDraft>;

  constructor() {
    super('LoveLogicDatabase');
    
    this.version(1).stores({
      threads: 'id, title, createdAt, updatedAt, isArchived, isPinned',
      messages: 'id, threadId, sender, timestamp, status',
      settings: 'id',
      drafts: 'threadId, lastSaved'
    });
  }
}

export const db = new RileyDatabase();