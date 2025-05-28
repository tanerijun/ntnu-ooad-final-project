import { HttpContext } from '@adonisjs/core/http'
import NotesService from '#services/notes_service'

export default class NotesController {
  private notesService = new NotesService()

  async index({ auth }: HttpContext) {
    await auth.check()
    return await this.notesService.getUserNotes(auth.user!.id)
  }

  async search({ request, auth }: HttpContext) {
    await auth.check()
    const query = request.input('q', '').trim()
    return await this.notesService.searchNotes(auth.user!.id, query)
  }

  async store({ request, auth }: HttpContext) {
    await auth.check()
    const title = request.input('title') || null
    const content = request.input('content') || ''
    const tagNames: string[] = request.input('tags') || []

    return await this.notesService.createNote(auth.user!.id, title, content, tagNames)
  }

  async show({ params, auth }: HttpContext) {
    await auth.check()
    return await this.notesService.getNoteById(params.id, auth.user!.id)
  }

  async update({ params, request, auth }: HttpContext) {
    await auth.check()
    const data = {
      title: request.input('title'),
      content: request.input('content'),
      tags: request.input('tags') || [],
    }
    return await this.notesService.updateNote(params.id, auth.user!.id, data)
  }

  async destroy({ params, auth }: HttpContext) {
    await auth.check()
    await this.notesService.deleteNote(params.id, auth.user!.id)
    return { message: 'Note deleted' }
  }
}
