import { api } from '@/lib/api';

export interface Message {
  id: string;
  at: string;
  from: string;
  fromName: string;
  text: string;
  read: boolean;
}

export interface MessageThread {
  threadId: string;
  caseId?: string;
  participants: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const messagesService = {
  async getThreads(): Promise<MessageThread[]> {
    return api.get('/messages/threads');
  },

  async getThreadsByUser(userId: string): Promise<MessageThread[]> {
    return api.get(`/messages/threads?userId=${userId}`);
  },

  async createThread(thread: Omit<MessageThread, 'threadId' | 'messages' | 'createdAt' | 'updatedAt'>): Promise<MessageThread> {
    return api.post('/messages/threads', thread);
  },

  async addMessage(threadId: string, message: Omit<Message, 'id'>): Promise<Message> {
    return api.post(`/messages/threads/${threadId}/messages`, message);
  },

  async markAsRead(threadId: string, messageId: string): Promise<void> {
    return api.put(`/messages/threads/${threadId}/messages/${messageId}/read`);
  }
};