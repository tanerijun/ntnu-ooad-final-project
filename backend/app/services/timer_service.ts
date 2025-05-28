import TimerSession from '#models/timer_session'
import UserTaskSetting from '#models/user_task'
import { DateTime } from 'luxon'
import BaseService from './base_service.js'

export default class TimerService extends BaseService {
  async getTimerSessions(userId: number, date?: string, subject?: string) {
    const query = TimerSession.query().where('user_id', userId)

    if (date) query.andWhere('date', date)
    if (subject) query.andWhere('subject', subject)

    return await query
  }

  async createTimerSession(data: any) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { user_id, date, subject, duration } = data

    if (!user_id || !date || duration === undefined) {
      throw new Error('Missing required fields: user_id, date, duration')
    }

    return await TimerSession.create({
      user_id,
      date,
      subject: subject || null,
      duration,
    })
  }

  async updateTimerSession(sessionId: number, data: any) {
    const session = await TimerSession.findOrFail(sessionId)
    const oldSubject = session.subject
    const { duration, subject } = data

    // Check for duplicate subject
    if (subject !== undefined && subject !== oldSubject) {
      const existingSession = await TimerSession.query()
        .where('user_id', session.user_id)
        .where('date', session.date)
        .where('subject', subject)
        .where('id', '!=', sessionId)
        .first()

      if (existingSession) {
        throw new Error('此科目名稱已存在，請使用其他名稱')
      }
    }

    if (duration !== undefined) session.duration = duration
    if (subject !== undefined) session.subject = subject

    await session.save()

    // Update UserTaskSetting if subject changed
    if (subject !== undefined && subject !== oldSubject) {
      await this.updateUserTaskSettings(session.user_id, oldSubject, subject)
    }

    return session
  }

  async getUserTasks(userId: number) {
    const today = DateTime.now().toISODate()

    // Get all today's sessions
    const allTodaySessions = await TimerSession.query()
      .where('user_id', userId)
      .where('date', today)

    // Get visible subject settings
    const settings = await UserTaskSetting.query()
      .where('user_id', userId)
      .andWhere('visible', true)
      .select('subject')

    const visibleSubjects = new Set(settings.map((s) => s.subject))
    const visibleSessions = allTodaySessions.filter((session) =>
      visibleSubjects.has(session.subject)
    )

    // Create missing sessions for visible subjects
    const existingSubjects = new Set(visibleSessions.map((s) => s.subject))
    const missingSubjects = settings.filter((s) => !existingSubjects.has(s.subject))

    const newSessions = await Promise.all(
      missingSubjects.map(async (setting) => {
        return await TimerSession.create({
          user_id: userId,
          date: today,
          subject: setting.subject,
          duration: 0,
        })
      })
    )

    const allSessions = [...visibleSessions, ...newSessions]
    allSessions.sort((a, b) => a.subject.localeCompare(b.subject))

    return allSessions
  }

  async hideUserTask(userId: number, subject: string) {
    const setting = await UserTaskSetting.query()
      .where('user_id', userId)
      .andWhere('subject', subject)
      .first()

    if (!setting) {
      throw new Error('找不到此科目的設定')
    }

    setting.visible = false
    await setting.save()
    return setting
  }

  async createUserTaskSetting(data: any) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { user_id, subject } = data

    const existing = await UserTaskSetting.query()
      .where('user_id', user_id)
      .where('subject', subject)
      .first()

    if (existing) {
      existing.visible = true
      await existing.save()
      return { setting: existing, wasCreated: false }
    }

    const newSetting = await UserTaskSetting.create(data)
    return { setting: newSetting, wasCreated: true }
  }

  private async updateUserTaskSettings(userId: number, oldSubject: string, newSubject: string) {
    const oldSetting = await UserTaskSetting.query()
      .where('user_id', userId)
      .where('subject', oldSubject)
      .first()

    if (!oldSetting) return

    const existingNewSetting = await UserTaskSetting.query()
      .where('user_id', userId)
      .where('subject', newSubject)
      .first()

    if (existingNewSetting) {
      existingNewSetting.visible = true
      await existingNewSetting.save()
      await oldSetting.delete()
    } else {
      oldSetting.subject = newSubject
      await oldSetting.save()
    }
  }
}
