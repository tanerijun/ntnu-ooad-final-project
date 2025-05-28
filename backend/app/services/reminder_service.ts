import Reminder from '#models/reminder'
import BaseService from './base_service.js'

export default class ReminderService extends BaseService {
  async getUserReminders(userId: number) {
    return await Reminder.query().where('user_id', userId).orderBy('reminder_time', 'asc')
  }

  async createReminder(userId: number, data: any) {
    return await Reminder.create({
      ...data,
      user_id: userId,
      is_completed: false,
      is_notified: false,
    })
  }

  async getReminderById(reminderId: number, userId: number) {
    return await Reminder.query().where('id', reminderId).where('user_id', userId).firstOrFail()
  }

  async updateReminder(reminderId: number, userId: number, data: any) {
    const reminder = await this.getReminderById(reminderId, userId)
    reminder.merge(data)
    await reminder.save()
    return reminder
  }

  async deleteReminder(reminderId: number, userId: number) {
    const reminder = await this.getReminderById(reminderId, userId)
    await reminder.delete()
  }

  async getPendingReminders(userId: number) {
    const now = new Date()

    const pendingReminders = await Reminder.query()
      .where('user_id', userId)
      .where('reminder_time', '<=', now)
      .where('is_notified', false)
      .where('is_completed', false)
      .orderBy('reminder_time', 'asc')

    // Mark as notified
    await Reminder.query()
      .where('user_id', userId)
      .where('reminder_time', '<=', now)
      .where('is_notified', false)
      .where('is_completed', false)
      .update({ is_notified: true })

    return pendingReminders
  }
}
