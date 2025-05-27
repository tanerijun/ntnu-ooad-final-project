import { HttpContext } from '@adonisjs/core/http'
import Reminder from '#models/reminder'

export default class RemindersController {
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const reminders = await Reminder.query()
        .where('user_id', user.id)
        .orderBy('reminder_time', 'asc')

      return response.ok(reminders)
    } catch (error) {
      return response.badRequest({ error: 'Failed to fetch reminders' })
    }
  }

  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const data = request.only(['title', 'description', 'reminder_time'])

      const reminder = await Reminder.create({
        ...data,
        user_id: user.id,
        is_completed: false,
        is_notified: false,
      })

      return response.created(reminder)
    } catch (error) {
      return response.badRequest({ error: 'Failed to create reminder' })
    }
  }

  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const reminder = await Reminder.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail()

      return response.ok(reminder)
    } catch (error) {
      return response.notFound({ error: 'Reminder not found' })
    }
  }

  async update({ auth, params, request, response }: HttpContext) {
    try {
      const user = auth.user!
      const reminder = await Reminder.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail()

      const data = request.only(['title', 'description', 'reminder_time', 'is_completed'])
      reminder.merge(data)
      await reminder.save()

      return response.ok(reminder)
    } catch (error) {
      return response.badRequest({ error: 'Failed to update reminder' })
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.user!
      const reminder = await Reminder.query()
        .where('id', params.id)
        .where('user_id', user.id)
        .firstOrFail()

      await reminder.delete()
      return response.ok({ message: 'Reminder deleted successfully' })
    } catch (error) {
      return response.badRequest({ error: 'Failed to delete reminder' })
    }
  }

  async getPending({ auth, response }: HttpContext) {
    try {
      const user = auth.user!
      const now = new Date()

      const pendingReminders = await Reminder.query()
        .where('user_id', user.id)
        .where('reminder_time', '<=', now)
        .where('is_notified', false)
        .where('is_completed', false)
        .orderBy('reminder_time', 'asc')

      // Mark as notified
      await Reminder.query()
        .where('user_id', user.id)
        .where('reminder_time', '<=', now)
        .where('is_notified', false)
        .where('is_completed', false)
        .update({ is_notified: true })

      return response.ok(pendingReminders)
    } catch (error) {
      return response.badRequest({ error: 'Failed to fetch pending reminders' })
    }
  }
}
