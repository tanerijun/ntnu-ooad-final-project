import Note from '#models/note'
import Tag from '#models/tag'
import BaseService from './base_service.js'

export default class NotesService extends BaseService {
  async getUserNotes(userId: number) {
    return await Note.query().where('userId', userId).preload('tags').orderBy('updatedAt', 'desc')
  }

  async searchNotes(userId: number, query: string) {
    if (!query.trim()) return []

    const searchTerm = `%${query}%`
    return await Note.query()
      .where('userId', userId)
      .andWhere((builder) => {
        builder
          .whereILike('title', searchTerm)
          .orWhereILike('content', searchTerm)
          .orWhereHas('tags', (tagBuilder) => {
            tagBuilder.whereILike('name', searchTerm)
          })
      })
      .preload('tags')
      .orderBy('updatedAt', 'desc')
      .limit(20)
  }

  async createNote(userId: number, title: string | null, content: string, tagNames: string[] = []) {
    const note = await Note.create({ title, content, userId })

    if (tagNames.length > 0) {
      const tagIds = await this.findOrCreateTags(tagNames)
      await note.related('tags').sync(tagIds)
    }

    await note.load('tags')
    return note
  }

  async getNoteById(noteId: number, userId: number) {
    return await Note.query()
      .where('id', noteId)
      .andWhere('userId', userId)
      .preload('tags')
      .firstOrFail()
  }

  async updateNote(noteId: number, userId: number, data: any) {
    const note = await Note.findOrFail(noteId)

    if (note.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const { title, content, tags: tagNames } = data

    if (typeof title === 'string' || title === null) {
      note.title = title
    }
    if (typeof content === 'string') {
      note.content = content
    }

    await note.save()

    if (Array.isArray(tagNames)) {
      const tagIds = await this.findOrCreateTags(tagNames)
      await note.related('tags').sync(tagIds)
    }

    await note.load('tags')
    return note
  }

  async deleteNote(noteId: number, userId: number) {
    const note = await Note.findOrFail(noteId)

    if (note.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await note.related('tags').detach()
    await note.delete()
  }

  private async findOrCreateTags(tagNames: string[]): Promise<number[]> {
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const trimmed = name.trim().toLowerCase()
        const existing = await Tag.findBy('name', trimmed)
        if (existing) return existing
        return await Tag.create({ name: trimmed })
      })
    )
    return tags.map((tag) => tag.id)
  }
}
