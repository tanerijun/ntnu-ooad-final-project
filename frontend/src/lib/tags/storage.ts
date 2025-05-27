'use client';

import { logger } from '@/lib/default-logger';

import { tagsClient } from './client';

export interface StoredTag {
  name: string;
  slug: string;
  createdAt: string;
}

export interface TagEventListener {
  onTagsUpdated: (tags: StoredTag[]) => void;
}

export class TagManager {
  private static instance: TagManager;
  private listeners: Set<TagEventListener> = new Set<TagEventListener>();
  private tags: StoredTag[] = [];
  private isLoaded = false;

  private constructor() {
    void this.loadFromDatabase();
  }

  public static getInstance(): TagManager {
    if (!TagManager.instance) {
      TagManager.instance = new TagManager();
    }
    return TagManager.instance;
  }

  public addListener(listener: TagEventListener): void {
    this.listeners.add(listener);
  }

  public removeListener(listener: TagEventListener): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener.onTagsUpdated([...this.tags]);
      } catch (error) {
        logger.error('Error notifying tag listener:', error);
      }
    });

    window.dispatchEvent(
      new CustomEvent('tagsUpdated', {
        detail: { tags: [...this.tags] },
      })
    );
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const dbTags = await tagsClient.getAll();
      this.tags = dbTags.map((tag) => ({
        name: tag.name,
        slug: this.createSlug(tag.name),
        createdAt: new Date().toISOString(),
      }));
      this.isLoaded = true;
      this.notifyListeners();
    } catch (error) {
      logger.error('Failed to load tags from database:', error);
      this.tags = [];
      this.isLoaded = true;
    }
  }

  private createSlug(name: string): string {
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  }

  public slugToName(slug: string): string {
    return decodeURIComponent(slug).replace(/-/g, ' ');
  }

  public async addTag(tagName: string): Promise<StoredTag> {
    const trimmed = tagName.trim().toLowerCase();

    if (!trimmed) {
      throw new Error('Tag name cannot be empty');
    }

    const existing = this.findByName(trimmed);
    if (existing) {
      return existing;
    }

    try {
      await tagsClient.create(trimmed);
      await this.loadFromDatabase();

      const newTag = this.findByName(trimmed);
      if (newTag) {
        return newTag;
      }

      throw new Error('Failed to create tag');
    } catch (error) {
      logger.error('Failed to add tag:', error);
      throw error;
    }
  }

  public async addTags(tagNames: string[]): Promise<StoredTag[]> {
    const uniqueNames = [...new Set(tagNames.map((name) => name.trim().toLowerCase()))];
    const newTags = uniqueNames.filter((name) => name && !this.findByName(name));

    if (newTags.length === 0) {
      return uniqueNames.map((name) => this.findByName(name)).filter(Boolean) as StoredTag[];
    }

    try {
      await tagsClient.createMultiple(newTags);
      await this.loadFromDatabase();

      return uniqueNames.map((name) => this.findByName(name)).filter(Boolean) as StoredTag[];
    } catch (error) {
      logger.error('Failed to add tags:', error);
      throw error;
    }
  }

  public async removeTag(tagName: string): Promise<boolean> {
    const trimmed = tagName.trim().toLowerCase();
    const tag = this.findByName(trimmed);

    if (!tag) {
      return false;
    }

    try {
      // Find the database tag to get its ID
      const dbTags = await tagsClient.getAll();
      const dbTag = dbTags.find((t) => t.name === trimmed);

      if (dbTag) {
        await tagsClient.delete(dbTag.id);
        await this.loadFromDatabase();
      }

      return true;
    } catch (error) {
      logger.error('Failed to remove tag:', error);
      throw error;
    }
  }

  public getAllTags(): StoredTag[] {
    return [...this.tags];
  }

  public getAllTagNames(): string[] {
    return this.tags.map((tag) => tag.name);
  }

  public getAllTagSlugs(): string[] {
    return this.tags.map((tag) => tag.slug);
  }

  public findByName(name: string): StoredTag | null {
    const trimmed = name.trim().toLowerCase();
    return this.tags.find((tag) => tag.name === trimmed) || null;
  }

  public findBySlug(slug: string): StoredTag | null {
    return this.tags.find((tag) => tag.slug === slug) || null;
  }

  public async syncTagsFromNotes(notesTags: string[]): Promise<void> {
    const uniqueTags = [...new Set(notesTags)];
    await this.addTags(uniqueTags);
  }

  public async refresh(): Promise<void> {
    await this.loadFromDatabase();
  }

  public isReady(): boolean {
    return this.isLoaded;
  }
}

export const tagManager = TagManager.getInstance();

export function useTagStorageSync() {
  const syncTags = async (tags: string[]) => {
    await tagManager.addTags(tags);
  };

  return { syncTags };
}
