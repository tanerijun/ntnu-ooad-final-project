import { HttpContext } from '@adonisjs/core/http'
import ReminderService from '#services/reminder_service'

export default class RemindersController {
  private reminderService = new ReminderService()

  async index({ auth, response }: HttpContext) {
    try {
      const reminders = await this.reminderService.getUserReminders(auth.user!.id)
      return response.ok(reminders)
    } catch (error) {
      return response.badRequest({ error: 'Failed to fetch reminders' })
    }
  }

  async store({ auth, request, response }: HttpContext) {
    try {
      const data = request.only(['title', 'description', 'reminder_time'])
      const reminder = await this.reminderService.createReminder(auth.user!.id, data)
      return response.created(reminder)
    } catch (error) {
      return response.badRequest({ error: 'Failed to create reminder' })
    }
  }

  async show({ auth, params, response }: HttpContext) {
    try {
      const reminder = await this.reminderService.getReminderById(params.id, auth.user!.id)
      return response.ok(reminder)
    } catch (error) {
      return response.notFound({ error: 'Reminder not found' })
    }
  }

  async update({ auth, params, request, response }: HttpContext) {
    try {
      const data = request.only(['title', 'description', 'reminder_time', 'is_completed'])
      const reminder = await this.reminderService.updateReminder(params.id, auth.user!.id, data)
      return response.ok(reminder)
    } catch (error) {
      return response.badRequest({ error: 'Failed to update reminder' })
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    try {
      await this.reminderService.deleteReminder(params.id, auth.user!.id)
      return response.ok({ message: 'Reminder deleted successfully' })
    } catch (error) {
      return response.badRequest({ error: 'Failed to delete reminder' })
    }
  }

  async getPending({ auth, response }: HttpContext) {
    try {
      const pendingReminders = await this.reminderService.getPendingReminders(auth.user!.id)
      return response.ok(pendingReminders)
    } catch (error) {
      return response.badRequest({ error: 'Failed to fetch pending reminders' })
    }
  }
}
