import type { HttpContext } from '@adonisjs/core/http'
import StudySession from '#models/study_session'

export default class SessionsController {
  async index({ response }: HttpContext) {
    const sessions = await StudySession.all()
    return response.ok(sessions)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['start_time', 'end_time', 'duration'])
    const session = await StudySession.create(data)
    return response.created(session)
  }
}
