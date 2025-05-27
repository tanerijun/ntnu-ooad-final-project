import { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import Tag from '#models/tag'

export default class NotesController {
  async index({ auth }: HttpContext) {
    await auth.check()

    return await Note.query()
      .where('userId', auth.user!.id)
      .preload('tags')
      .orderBy('updatedAt', 'desc')
  }

  async search({ request, auth }: HttpContext) {
    await auth.check()

    const query = request.input('q', '').trim()

    if (!query) {
      return []
    }

    const searchTerm = `%${query}%`

    return await Note.query()
      .where('userId', auth.user!.id)
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

  async store({ request, auth }: HttpContext) {
    await auth.check()

    const title = request.input('title') || null
    const content = request.input('content') || ''
    const tagNames: string[] = request.input('tags') || []

    const note = await Note.create({ title, content, userId: auth.user!.id })

    if (tagNames.length > 0) {
      const tagIds = await this.findOrCreateTags(tagNames)
      await note.related('tags').sync(tagIds)
    }

    await note.load('tags')
    return note
  }

  async show({ params, auth }: HttpContext) {
    await auth.check()

    const note = await Note.query()
      .where('id', params.id)
      .andWhere('userId', auth.user!.id)
      .preload('tags')
      .firstOrFail()

    return note
  }

  async update({ params, request, auth }: HttpContext) {
    await auth.check()

    const note = await Note.findOrFail(params.id)

    if (note.userId !== auth.user!.id) {
      throw new Error('Unauthorized')
    }

    const title = request.input('title')
    const content = request.input('content')
    const tagNames: string[] = request.input('tags') || []

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

  async destroy({ params, auth }: HttpContext) {
    await auth.check()

    const note = await Note.findOrFail(params.id)

    if (note.userId !== auth.user!.id) {
      throw new Error('Unauthorized')
    }

    await note.related('tags').detach()
    await note.delete()

    return { message: 'Note deleted' }
  }

  /**
   * Helper to find or create tags by name and return their IDs
   */
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
