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
  // 在 TimerSessionsController 新增 store 方法
  public async store({ request, response }: HttpContext) {
    // 從請求體獲取資料（POST 請求的資料在 body 裡）
    const data = request.only(['user_id', 'date', 'subject', 'duration'])

    // 驗證必填欄位（這裡用簡單檢查，建議用 Validator）
    if (
      typeof data.user_id === 'undefined' ||
      typeof data.date === 'undefined' ||
      typeof data.duration === 'undefined'
    ) {
      return response.status(400).json({
        error: 'Missing required fields: user_id, date, duration',
      })
    }

    try {
      // 創建新紀錄並保存到資料庫
      const timerSession = await TimerSession.create({
        user_id: data.user_id,
        date: data.date,
        subject: data.subject || null, // 允許 subject 為空
        duration: data.duration,
      })

      return response.status(201).json(timerSession)
    } catch (error) {
      return response.status(500).json({
        error: '無法建立計時紀錄，請稍後再試',
      })
    }
  }
  public async update({ params, request, response }: HttpContext) {
    const { id } = params
    const { duration } = request.only(['duration'])

    try {
      const session = await TimerSession.findOrFail(id)
      session.duration = duration
      await session.save()

      return response.json(session)
    } catch (error) {
      return response.status(404).json({
        error: '找不到計時記錄',
      })
    }
  }
}
