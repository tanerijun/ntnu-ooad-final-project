// import { HttpContext } from '@adonisjs/core/http'
// import Note from '#models/note'
// import Tag from '#models/tag'

// export default class NotesController {
//   async index({ auth }: HttpContext) {
//     await auth.check()

//     return await Note.query().where('userId', auth.user!.id).preload('tags') // Include associated tags
//   }

//   async store({ request, auth }: HttpContext) {
//     await auth.check()

//     const content = request.input('content') || ''
//     const tagNames: string[] = request.input('tags') || []

//     const note = await Note.create({ content, userId: auth.user!.id })

//     if (tagNames.length > 0) {
//       const tagIds = await this.findOrCreateTags(tagNames)
//       await note.related('tags').sync(tagIds)
//       console.log('tagId', tagIds)
//     }
//     console.log('Received tags:', tagNames)

//     await note.load('tags')
//     return note
//   }

//   async show({ params, auth }: HttpContext) {
//     await auth.check()

//     const note = await Note.query()
//       .where('id', params.id)
//       .andWhere('userId', auth.user!.id)
//       .preload('tags')
//       .firstOrFail()

//     return note
//   }

//   async update({ params, request, auth }: HttpContext) {
//     await auth.check()

//     const note = await Note.findOrFail(params.id)
//     if (note.userId !== auth.user!.id) {
//       throw new Error('Unauthorized')
//     }

//     const content = request.input('content')
//     const tagNames: string[] = request.input('tags') || []

//     if (typeof content === 'string') {
//       note.content = content
//     }

//     await note.save()

//     if (Array.isArray(tagNames)) {
//       const tagIds = await this.findOrCreateTags(tagNames)
//       await note.related('tags').sync(tagIds)
//     }

//     await note.load('tags')
//     return note
//   }

//   async destroy({ params, auth }: HttpContext) {
//     await auth.check()

//     const note = await Note.findOrFail(params.id)
//     if (note.userId !== auth.user!.id) {
//       throw new Error('Unauthorized')
//     }

//     await note.related('tags').detach()
//     await note.delete()

//     return { message: 'Note deleted' }
//   }

//   /**
//    * Helper: Ensure all tag names exist in DB and return their IDs
//    */
//   private async findOrCreateTags(tagNames: string[]): Promise<number[]> {
//     const tags = await Promise.all(
//       tagNames.map(async (name) => {
//         const existing = await Tag.findBy('name', name)
//         if (existing) return existing
//         return await Tag.create({ name })
//       })
//     )

//     return tags.map((tag) => tag.id)
//   }
// }

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

  async store({ request, auth }: HttpContext) {
    await auth.check()

    const content = request.input('content') || ''
    const tagNames: string[] = request.input('tags') || []

    const note = await Note.create({ content, userId: auth.user!.id })

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

    const content = request.input('content')
    const tagNames: string[] = request.input('tags') || []

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
