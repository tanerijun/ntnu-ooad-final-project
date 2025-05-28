import { HttpContext } from '@adonisjs/core/http'
import TimerService from '#services/timer_service'

export default class TaskSettingsController {
  private timerService = new TimerService()

  public async index({ auth, response }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ error: '未登入' })
    }

    try {
      const allSessions = await this.timerService.getUserTasks(auth.user.id)
      return response.json(allSessions)
    } catch (error) {
      return response.status(500).json({ error: '伺服器錯誤，無法取得任務資料' })
    }
  }

  public async hide({ auth, params, response }: HttpContext) {
    if (!auth.user) {
      return response.status(401).json({ error: '未登入' })
    }

    const subject = params.subject
    if (!subject) {
      return response.status(400).json({ error: '缺少科目參數' })
    }

    try {
      const subjectName = decodeURIComponent(subject)
      const setting = await this.timerService.hideUserTask(auth.user.id, subjectName)
      return response.json(setting)
    } catch (error) {
      if (error.message === '找不到此科目的設定') {
        return response.status(404).json({ error: error.message })
      }
      return response.status(500).json({ error: '伺服器錯誤，無法更新設定' })
    }
  }

  public async store({ request, response }: HttpContext) {
    const data = request.only(['user_id', 'subject', 'visible'])

    if (!data.user_id || !data.subject || data.visible === undefined) {
      return response.status(400).json({ error: 'user_id, subject, visible 為必填' })
    }

    try {
      const result = await this.timerService.createUserTaskSetting(data)
      const statusCode = result.wasCreated ? 201 : 200
      return response.status(statusCode).json(result.setting)
    } catch (error) {
      return response.status(500).json({ error: '無法建立 user_task_setting' })
    }
  }
}
