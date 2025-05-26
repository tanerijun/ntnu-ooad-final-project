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

    // 取得今日所有計時資料
    const today = DateTime.now().toISODate()
    const allTodaySessions = await TimerSession.query()
      .where('user_id', user.id)
      .where('date', today)

    // 取得可視科目設定
    const settings = await UserTaskSetting.query()
      .where('user_id', user.id)
      .andWhere('visible', true)
      .select('subject')

    const visibleSubjects = new Set(settings.map((s) => s.subject))

    // 過濾出可視的計時記錄
    const visibleSessions = allTodaySessions.filter((session) =>
      visibleSubjects.has(session.subject)
    )

    // 為沒有計時記錄的可視科目創建預設記錄
    const existingSubjects = new Set(visibleSessions.map((s) => s.subject))
    const missingSubjects = settings.filter((s) => !existingSubjects.has(s.subject))

    const newSessions = await Promise.all(
      missingSubjects.map(async (setting) => {
        return await TimerSession.create({
          user_id: user.id,
          date: today,
          subject: setting.subject,
          duration: 0,
        })
      })
    )

    const allSessions = [...visibleSessions, ...newSessions]
    // 按科目名稱字母順序排序
    allSessions.sort((a, b) => a.subject.localeCompare(b.subject))
    return response.json(allSessions)
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
