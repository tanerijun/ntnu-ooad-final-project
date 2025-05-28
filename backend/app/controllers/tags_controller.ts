import { HttpContext } from '@adonisjs/core/http'
import TagsService from '#services/tags_service'

export default class TagsController {
  private tagsService = new TagsService()

  async index({ auth }: HttpContext) {
    await auth.check()
    return await this.tagsService.getUserTags(auth.user!.id)
  }

  async store({ request, auth }: HttpContext) {
    await auth.check()

    try {
      const name = request.input('name')
      return await this.tagsService.createTag(name)
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async destroy({ params, auth }: HttpContext) {
    await auth.check()

    try {
      await this.tagsService.deleteTag(params.id)
      return { message: 'Tag deleted' }
    } catch (error) {
      throw new Error('Failed to delete tag')
    }
  }
}
