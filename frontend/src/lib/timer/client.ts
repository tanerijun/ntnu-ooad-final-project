// src/lib/timer/client.ts
'use client';

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';

export interface TimerSession {
  id: number;
  user_id: number;
  date: string;
  subject: string;
  duration: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface CreateTimerSessionRequest {
  user_id: number;
  date: string;
  subject?: string; // 可為空
  duration: number;
}
export interface UpdateTimerSessionRequest {
  duration: number; // 明确定义更新需要的字段
}

export class TimerSessionsClient {
  async getAll(userId: number, filters?: { date?: string; subject?: string }): Promise<TimerSession[]> {
    try {
      const params = new URLSearchParams({
        user_id: userId.toString(),
        ...(filters?.date && { date: filters.date }),
        ...(filters?.subject && { subject: filters.subject }),
      });

      return await apiClient.get<TimerSession[]>(`/timer_session_show?${params.toString()}`);
    } catch (error) {
      logger.error('獲取計時記錄失敗:', error);
      return [];
    }
  }
  async create(data: CreateTimerSessionRequest): Promise<TimerSession | null> {
    try {
      return await apiClient.post<TimerSession>('/timer_sessions_store', data);
    } catch (error) {
      logger.error('新增計時記錄失敗:', error);
      return null;
    }
  }
  async update(id: number, data: UpdateTimerSessionRequest): Promise<TimerSession | null> {
    try {
      return await apiClient.put<TimerSession>(`/timer_sessions/${id}`, data); // 使用PUT方法
    } catch (error) {
      logger.error('更新計時記錄失敗:', error);
      return null;
    }
  }
  // 獲取今日任務列表
  async fetchTodayTasks(): Promise<TimerSession[]> {
    try {
      return await apiClient.get<TimerSession[]>('/user_tasks_today');
    } catch (error) {
      logger.error('取得今日任務失敗:', error);
      return [];
    }
  }

  // 隱藏特定科目任務
  // client.ts
  async hideTask(subject: string): Promise<{ success: boolean }> {
    try {
      //const encodedSubject = encodeURIComponent(subject);
      await apiClient.put(`/user_tasks_hide/${subject}`);

      return { success: true };
    } catch (error) {
      logger.error('隱藏任務失敗:', error);
      return { success: false };
    }
  }

  // 新增 user_task_setting
  async addUserTaskSetting(userId: number, subject: string, visible = true): Promise<{ success: boolean }> {
    try {
      await apiClient.post('/user_tasks_store', {
        user_id: userId,
        subject,
        visible,
      });
      return { success: true };
    } catch (error) {
      logger.error('新增 user_task_setting 失敗:', error);
      return { success: false };
    }
  }
}

export const timerSessionsClient = new TimerSessionsClient();
