import { HttpContext } from '@adonisjs/core/http'
import Tag from '#models/tag'

export default class TagsController {
  async index({ auth }: HttpContext) {
    await auth.check()

    return await Tag.query().orderBy('name', 'asc')
  }

  async store({ request, auth }: HttpContext) {
    await auth.check()

    const name = request.input('name')
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

  async destroy({ params, auth }: HttpContext) {
    await auth.check()

    const tag = await Tag.findOrFail(params.id)
    await tag.delete()

    return { message: 'Tag deleted' }
  }
}
