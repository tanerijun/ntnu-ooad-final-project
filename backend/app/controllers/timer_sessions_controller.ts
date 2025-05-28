import type { HttpContext } from '@adonisjs/core/http'
import TimerService from '#services/timer_service'

export default class TimerSessionsController {
  private timerService = new TimerService()

  public async index({ request, response }: HttpContext) {
    const userId = request.input('user_id')
    const date = request.input('date')
    const subject = request.input('subject')

    if (!userId) {
      return response.status(400).json({ error: 'user_id is required' })
    }

    try {
      const timerSessions = await this.timerService.getTimerSessions(userId, date, subject)
      return response.json(timerSessions)
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch timer sessions' })
    }
  }

  public async store({ request, response }: HttpContext) {
    const data = request.only(['user_id', 'date', 'subject', 'duration'])

    try {
      const timerSession = await this.timerService.createTimerSession(data)
      return response.status(201).json(timerSession)
    } catch (error) {
      if (error.message.includes('Missing required fields')) {
        return response.status(400).json({ error: error.message })
      }
      return response.status(500).json({ error: '無法建立計時紀錄，請稍後再試' })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    const { id } = params
    const data = request.only(['duration', 'subject'])

    try {
      const session = await this.timerService.updateTimerSession(id, data)
      return response.json(session)
    } catch (error) {
      if (error.message === '此科目名稱已存在，請使用其他名稱') {
        return response.status(400).json({ error: error.message })
      }
      if (error.message.includes('not found')) {
        return response.status(404).json({ error: '找不到計時記錄' })
      }
      return response.status(500).json({ error: 'Failed to update timer session' })
    }
  }
}
