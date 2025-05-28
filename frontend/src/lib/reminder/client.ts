import type { CreateReminderRequest, Reminder, UpdateReminderRequest } from '@/types/reminder';
import { apiClient } from '@/lib/api/client';

export class ReminderClient {
  private transformToSnakeCase(data: CreateReminderRequest | UpdateReminderRequest): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};

    if ('title' in data) transformed.title = data.title;
    if ('description' in data) transformed.description = data.description;
    if ('reminderTime' in data) transformed.reminder_time = data.reminderTime;
    if ('isCompleted' in data) transformed.is_completed = data.isCompleted;

    return transformed;
  }

  async getReminders(): Promise<Reminder[]> {
    return apiClient.get<Reminder[]>('/reminders');
  }

  async createReminder(data: CreateReminderRequest): Promise<Reminder> {
    const transformedData = this.transformToSnakeCase(data);
    return apiClient.post<Reminder>('/reminders', transformedData);
  }

  async updateReminder(id: number, data: UpdateReminderRequest): Promise<Reminder> {
    const transformedData = this.transformToSnakeCase(data);
    return apiClient.put<Reminder>(`/reminders/${id}`, transformedData);
  }

  async deleteReminder(id: number): Promise<void> {
    return apiClient.delete(`/reminders/${id}`);
  }

  async getPendingReminders(): Promise<Reminder[]> {
    return apiClient.get<Reminder[]>('/reminders/pending');
  }
}

export const reminderClient = new ReminderClient();
