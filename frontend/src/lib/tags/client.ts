import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';

export interface Tag {
  id: number;
  name: string;
}

export class TagsClient {
  async getAll(): Promise<Tag[]> {
    try {
      return await apiClient.get<Tag[]>('/tags');
    } catch (error) {
      logger.error('Failed to fetch tags:', error);
      throw error;
    }
  }

  async create(name: string): Promise<Tag> {
    try {
      return await apiClient.post<Tag>('/tags', { name });
    } catch (error) {
      logger.error('Failed to create tag:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tags/${id}`);
    } catch (error) {
      logger.error('Failed to delete tag:', error);
      throw error;
    }
  }

  async createMultiple(names: string[]): Promise<Tag[]> {
    try {
      const uniqueNames = [...new Set(names.map(name => name.trim().toLowerCase()))];
      const tags = await Promise.all(
        uniqueNames.map(name => this.create(name))
      );
      return tags;
    } catch (error) {
      logger.error('Failed to create multiple tags:', error);
      throw error;
    }
  }
}

export const tagsClient = new TagsClient();