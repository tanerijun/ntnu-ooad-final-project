import Tag from '#models/tag'
import BaseService from './base_service.js'

export default class TagsService extends BaseService {
  async getUserTags(userId: number) {
    return await Tag.query()
      .whereHas('notes', (noteBuilder) => {
        noteBuilder.where('userId', userId)
      })
      .orderBy('name', 'asc')
  }

  async createTag(name: string) {
    if (!name || !name.trim()) {
      throw new Error('Tag name is required')
    }

    const trimmed = name.trim().toLowerCase()

    const existing = await Tag.findBy('name', trimmed)
    if (existing) {
      return existing
    }

    return await Tag.create({ name: trimmed })
  }

  async deleteTag(tagId: number) {
    const tag = await Tag.findOrFail(tagId)
    await tag.delete()
  }
}
