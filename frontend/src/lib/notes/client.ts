'use client';

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';

// export interface Note {
//   id: number;
//   content: string;
//   createdAt: string;
//   updatedAt: string;
//   tags: string[];
// }

export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];  // not string[]
}

export class NotesClient {
  async create(tags: string[] = []): Promise<Note | null> {
    try {
      logger.debug('Creating note with tags:', tags);
      return await apiClient.post<Note>('/notes', {
        content: '',
        tags,
      });
    } catch (error) {
      logger.error('Note creation failed:', error);
      return null;
    }
  }

  async getAll(): Promise<Note[]> {
    try {
      return await apiClient.get<Note[]>('/notes');
    } catch (error) {
      logger.error('Failed to fetch notes:', error);
      return [];
    }
  }

  async get(id: number): Promise<Note | null> {
    try {
      return await apiClient.get<Note>(`/notes/${id}`);
    } catch (error) {
      logger.error(`Failed to fetch note ${id}:`, error);
      return null;
    }
  }

  async update(id: number, content: string, tags?: string[]): Promise<Note | null> {
    try {
      logger.debug(`Updating note ${id} with content and tags`, { content, tags });
      return await apiClient.put<Note>(`/notes/${id}`, { content, tags });
    } catch (error) {
      logger.error(`Failed to update note ${id}:`, error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`/notes/${id}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete note ${id}:`, error);
      return false;
    }
  }
}

export const notesClient = new NotesClient();
