import TimerSession from '#models/timer_session'
import UserTaskSetting from '#models/user_task'
import type { HttpContext } from '@adonisjs/core/http'

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
    const data = request.only(['duration', 'subject'])

    try {
      const session = await TimerSession.findOrFail(id)
      const oldSubject = session.subject

      // 驗證新科目名稱是否已存在（排除當前記錄）
      if (data.subject !== undefined && data.subject !== oldSubject) {
        const existingSession = await TimerSession.query()
          .where('user_id', session.user_id)
          .where('date', session.date)
          .where('subject', data.subject)
          .where('id', '!=', id)
          .first()

        if (existingSession) {
          return response.status(400).json({
            error: '此科目名稱已存在，請使用其他名稱',
          })
        }
      }

      if (data.duration !== undefined) {
        session.duration = data.duration
      }

      if (data.subject !== undefined) {
        session.subject = data.subject
      }

      await session.save()

      // 如果科目名稱有變更，需要更新 UserTaskSetting
      if (data.subject !== undefined && data.subject !== oldSubject) {
        // 查找舊的 UserTaskSetting
        const oldSetting = await UserTaskSetting.query()
          .where('user_id', session.user_id)
          .where('subject', oldSubject)
          .first()

        if (oldSetting) {
          // 檢查新科目名稱是否已存在設定
          const existingNewSetting = await UserTaskSetting.query()
            .where('user_id', session.user_id)
            .where('subject', data.subject)
            .first()

          if (existingNewSetting) {
            // 如果新科目名稱已存在，確保它是可見的，然後刪除舊設定
            existingNewSetting.visible = true
            await existingNewSetting.save()
            await oldSetting.delete()
          } else {
            // 如果新科目名稱不存在，更新舊設定的科目名稱
            oldSetting.subject = data.subject
            await oldSetting.save()
          }
        } else {
          // 如果找不到舊設定，為新科目創建設定
          await UserTaskSetting.create({
            user_id: session.user_id,
            subject: data.subject,
            visible: true,
          })
        }
      }

      return response.json(session)
    } catch (error) {
      return response.status(404).json({
        error: '找不到計時記錄',
      })
    }
  }
}
