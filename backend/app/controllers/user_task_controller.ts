// app/Controllers/Http/TaskSettingsController.ts
import { HttpContext } from '@adonisjs/core/http'
import UserTaskSetting from '#models/user_task'
import TimerSession from '#models/timer_session'
import { DateTime } from 'luxon'

export default class TaskSettingsController {
  // 取得使用者所有可視任務
  public async index({ auth, response }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ error: '未登入' })
    }
    const user = auth.user

    const settings = await UserTaskSetting.query()
      .where('user_id', user.id)
      .andWhere('visible', true)
      .select('subject')

    // 取得今日計時資料（自動補齊缺失資料）
    const today = DateTime.now().toISODate()
    const tasks = await Promise.all(
      settings.map(async (setting) => {
        let session = await TimerSession.query()
          .where('user_id', user.id)
          .where('date', today)
          .where('subject', setting.subject)
          .first()
        // 如果今天沒有計時資料，則創建一個新的計時紀錄且預設為0
        if (!session) {
          session = await TimerSession.create({
            user_id: user.id,
            date: today,
            subject: setting.subject,
            duration: 0,
          })
        }

        return session
      })
    )

    return response.json(tasks)
  }

  // 切換任務可視狀態
  public async hide({ auth, params, response }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ error: '未登入' })
    }

    const subject = params.subject
    if (!subject) {
      return response.status(400).json({ error: '缺少科目參數' })
    }

    try {
      const user = auth.user
      console.log('hideTask 方法被呼叫，userid:', user.id)
      const subjectname = decodeURIComponent(params.subject)

      const setting = await UserTaskSetting.query()
        .where('user_id', user.id)
        .andWhere('subject', subjectname)
        .first()
      console.log('hideTask setting:', setting, subject)
      if (!setting) {
        return response.status(404).json({ error: '找不到此科目的設定' })
      }

      setting.visible = false // 直接設為隱藏
      await setting.save()

      return response.json(setting)
    } catch (error) {
      return response.status(500).json({ error: '伺服器錯誤，無法更新設定' })
    }
  }

  public async store({ request, response }: HttpContext) {
    const data = request.only(['user_id', 'subject', 'visible'])

    // 基本驗證
    if (
      typeof data.user_id === 'undefined' ||
      typeof data.subject === 'undefined' ||
      typeof data.visible === 'undefined'
    ) {
      return response.status(400).json({ error: 'user_id, subject, visible 為必填' })
    }

    try {
      // 查詢是否存在
      const exists = await UserTaskSetting.query()
        .where('user_id', data.user_id)
        .where('subject', data.subject)
        .first()

      if (exists) {
        // 若存在，更新 visible 為 true
        exists.visible = true
        await exists.save()
        return response.status(200).json(exists)
      }

      // 不存在則建立新紀錄
      const setting = await UserTaskSetting.create(data)
      return response.status(201).json(setting)
    } catch (error) {
      return response.status(500).json({ error: '無法建立 user_task_setting' })
    }
  }
}
