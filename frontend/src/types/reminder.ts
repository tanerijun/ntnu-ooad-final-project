export interface Reminder {
  id: number;
  userId: number;
  title: string;
  description?: string;
  reminderTime: string;
  isCompleted: boolean;
  isNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRequest {
  title: string;
  description?: string;
  reminderTime: string;
}

export interface UpdateReminderRequest {
  title?: string;
  description?: string;
  reminderTime?: string;
  isCompleted?: boolean;
}

export interface ReminderFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
}