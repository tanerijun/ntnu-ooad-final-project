import type { HttpContext } from '@adonisjs/core/http'
import TimerSession from '#models/timer_session' // 假設已建立 TimerSession 模型

export default class TimerSessionsController {
  public async index({ request, response }: HttpContext) {
    // 獲取查詢參數
    const userId = request.input('user_id')
    const date = request.input('date')
    const subject = request.input('subject')

    // 驗證必填參數
    if (!userId) {
      return response.status(400).json({ error: 'user_id is required' })
    }

    // 構建查詢
    const query = TimerSession.query().where('user_id', userId)

    if (date) {
      query.andWhere('date', date)
    }

    if (subject) {
      query.andWhere('subject', subject)
    }

    // 執行查詢並返回結果
    const timerSessions = await query
    return response.json(timerSessions)
  }
}
