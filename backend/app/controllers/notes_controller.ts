import { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'

export default class NotesController {
  async index({ auth }: HttpContext) {
    await auth.check()
    return await Note.query().where('userId', auth.user!.id)
  }

  async store({ request, auth }: HttpContext) {
    await auth.check()
    const content = request.input('content') || ''
    return await Note.create({ content, userId: auth.user!.id })
  }

  async show({ params, auth }: HttpContext) {
    await auth.check()
    const note = await Note.findOrFail(params.id)
    if (note.userId !== auth.user!.id) {
      throw new Error('Unauthorized')
    }
    return note
  }

  async update({ params, request, auth }: HttpContext) {
    await auth.check()
    const note = await Note.findOrFail(params.id)
    if (note.userId !== auth.user!.id) {
      throw new Error('Unauthorized')
    }
    note.content = request.input('content')
    await note.save()
    return note
  }

  async destroy({ params, auth }: HttpContext) {
    await auth.check()
    const note = await Note.findOrFail(params.id)
    if (note.userId !== auth.user!.id) {
      throw new Error('Unauthorized')
    }
    await note.delete()
    return { message: 'Note deleted' }
  }
}
