'use client';

import { logger } from '@/lib/default-logger';

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
  private readonly STORAGE_KEY = '__app_tags__';
  private listeners: Set<TagEventListener> = new Set<TagEventListener>();
  private tags: StoredTag[] = [];

  private constructor() {
    this.loadFromStorage();
    this.migrateOldTags();
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
    this.listeners.forEach(listener => {
      try {
        listener.onTagsUpdated([...this.tags]);
      } catch (error) {
        logger.error('Error notifying tag listener:', error);
      }
    });

    // Also dispatch browser event for components using addEventListener
    window.dispatchEvent(new CustomEvent('tagsUpdated', { 
      detail: { tags: [...this.tags] } 
    }));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      this.tags = stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load tags from storage:', error);
      this.tags = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tags));
    } catch (error) {
      logger.error('Failed to save tags to localStorage:', error);
    }
  }

  private createSlug(name: string): string {
    return encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  }

  public slugToName(slug: string): string {
    return decodeURIComponent(slug).replace(/-/g, ' ');
  }

  public addTag(tagName: string): StoredTag {
    const trimmed = tagName.trim().toLowerCase();
    
    if (!trimmed) {
      throw new Error('Tag name cannot be empty');
    }

    const existing = this.findByName(trimmed);
    if (existing) {
      return existing;
    }

    const newTag: StoredTag = {
      name: trimmed,
      slug: this.createSlug(trimmed),
      createdAt: new Date().toISOString()
    };

    this.tags.push(newTag);
    this.saveToStorage();
    this.notifyListeners();

    return newTag;
  }

  public addTags(tagNames: string[]): StoredTag[] {
    const addedTags: StoredTag[] = [];
    let hasChanges = false;

    tagNames.forEach(name => {
      const trimmed = name.trim().toLowerCase();
      if (trimmed && !this.findByName(trimmed)) {
        const newTag: StoredTag = {
          name: trimmed,
          slug: this.createSlug(trimmed),
          createdAt: new Date().toISOString()
        };
        this.tags.push(newTag);
        addedTags.push(newTag);
        hasChanges = true;
      } else if (trimmed) {
        const existing = this.findByName(trimmed);
        if (existing) {
          addedTags.push(existing);
        }
      }
    });

    if (hasChanges) {
      this.saveToStorage();
      this.notifyListeners();
    }

    return addedTags;
  }

  public removeTag(tagName: string): boolean {
    const trimmed = tagName.trim().toLowerCase();
    const index = this.tags.findIndex(tag => tag.name === trimmed);
    
    if (index === -1) {
      return false;
    }

    this.tags.splice(index, 1);
    this.saveToStorage();
    this.notifyListeners();
    return true;
  }

  public getAllTags(): StoredTag[] {
    return [...this.tags];
  }

  public getAllTagNames(): string[] {
    return this.tags.map(tag => tag.name);
  }

  public getAllTagSlugs(): string[] {
    return this.tags.map(tag => tag.slug);
  }

  public findByName(name: string): StoredTag | null {
    const trimmed = name.trim().toLowerCase();
    return this.tags.find(tag => tag.name === trimmed) || null;
  }

  public findBySlug(slug: string): StoredTag | null {
    return this.tags.find(tag => tag.slug === slug) || null;
  }

  public syncTagsFromNotes(notesTags: string[]): void {
    const uniqueTags = [...new Set(notesTags)];
    this.addTags(uniqueTags);
  }

  public clear(): void {
    this.tags = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  private migrateOldTags(): void {
    try {
      let hasOldData = false;

      // Migrate from sidebar tags (__local_tags__)
      const oldSidebarTags = localStorage.getItem('__local_tags__');
      if (oldSidebarTags) {
        const sidebarTags = JSON.parse(oldSidebarTags);
        if (Array.isArray(sidebarTags)) {
          sidebarTags.forEach((slug: string) => {
            const name = this.slugToName(slug);
            if (name && !this.findByName(name)) {
              this.tags.push({
                name: name.toLowerCase(),
                slug: this.createSlug(name),
                createdAt: new Date().toISOString()
              });
              hasOldData = true;
            }
          });
        }
        localStorage.removeItem('__local_tags__');
      }

      // Migrate from note editor tags (__available_tags__)
      const oldAvailableTags = localStorage.getItem('__available_tags__');
      if (oldAvailableTags) {
        const availableTags = JSON.parse(oldAvailableTags);
        if (Array.isArray(availableTags)) {
          availableTags.forEach((name: string) => {
            const trimmed = name.trim().toLowerCase();
            if (trimmed && !this.findByName(trimmed)) {
              this.tags.push({
                name: trimmed,
                slug: this.createSlug(trimmed),
                createdAt: new Date().toISOString()
              });
              hasOldData = true;
            }
          });
        }
        localStorage.removeItem('__available_tags__');
      }

      if (hasOldData) {
        this.saveToStorage();
        logger.debug('Successfully migrated old tags to new system');
      }
    } catch (error) {
      logger.error('Failed to migrate old tags:', error);
    }
  }
}

// Convenience functions for backward compatibility and easier usage
export const tagManager = TagManager.getInstance();

export function getAllTagNames(): string[] {
  return tagManager.getAllTagNames();
}

export function getAllTagSlugs(): string[] {
  return tagManager.getAllTagSlugs();
}

export function addTagToStorage(tagName: string): StoredTag {
  return tagManager.addTag(tagName);
}

export function addTagsToStorage(tagNames: string[]): StoredTag[] {
  return tagManager.addTags(tagNames);
}

export function findTagByName(name: string): StoredTag | null {
  return tagManager.findByName(name);
}

export function findTagBySlug(slug: string): StoredTag | null {
  return tagManager.findBySlug(slug);
}

export function slugToTagName(slug: string): string {
  return tagManager.slugToName(slug);
}

export function tagNameToSlug(name: string): string {
  const tag = tagManager.findByName(name);
  return tag ? tag.slug : tagManager['createSlug'](name);
}

export function syncTagsFromNotes(notesTags: string[]): void {
  tagManager.syncTagsFromNotes(notesTags);
}

export function initializeTagStorage(): void {
  // Initialization is handled in the constructor via getInstance()
  TagManager.getInstance();
}

export function useTagStorageSync() {
  const syncTags = (tags: string[]) => {
    tagManager.addTags(tags);
  };
  
  return { syncTags };
}