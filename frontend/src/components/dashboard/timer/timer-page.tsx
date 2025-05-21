// TimerPage.tsx
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { timerSessionsClient, type TimerSession } from '@/lib/timer/client';
import { useUser } from '@/hooks/use-user';
import { AddTimerButton } from '@/components/dashboard/timer/add-timer-button';
import { StudyTaskCard } from '@/components/dashboard/timer/study-task-card';

interface Task {
  id: number;
  subject: string;
  duration: number; // 新增 duration 屬性
}

export function TimerPage(): React.JSX.Element {
  const { user } = useUser();
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  //const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRecords, setTimeRecords] = useState<Record<number, number>>({});

  const fetchSessions = React.useCallback(async () => {
    if (!user) return;
    setError(null);

    try {
      const todayTasks = await timerSessionsClient.fetchTodayTasks();
      setSessions(todayTasks);

      // 同步設定 timeRecords
      const newTimeRecords: Record<number, number> = {};
      todayTasks.forEach((session) => {
        newTimeRecords[session.id] = session.duration;
      });
      setTimeRecords(newTimeRecords);
    } catch (err) {
      setError('載入失敗，請稍後再試');
    }
  }, [user]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(
      sessions.map((session) => ({
        id: session.id,
        subject: session.subject,
        duration: session.duration, // 加入 duration
      }))
    );
  }, [sessions]);
  //logger.debug(sessions);

  const handleTimeUpdate = React.useCallback((id: number, seconds: number) => {
    setTimeRecords((prev) => ({
      ...prev,
      [id]: seconds,
    }));
  }, []);

  const totalDuration = Object.values(timeRecords).reduce((sum, seconds) => sum + seconds, 0);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <Stack spacing={4} alignItems="center" paddingTop={4}>
      <AddTimerButton onSuccess={fetchSessions} />
      <Typography variant="h5" fontWeight="bold">
        📚 今日累積讀書時間：{Math.floor(totalDuration / 60)}分{totalDuration % 60}秒
      </Typography>
      <Stack spacing={3} width="100%" alignItems="center">
        {tasks.map((task) => (
          <StudyTaskCard
            key={task.id}
            taskId={task.id} // 必須傳入
            subjectName={task.subject}
            initialDuration={task.duration}
            onTimeUpdate={(seconds) => {
              handleTimeUpdate(task.id, seconds);
            }}
            onSaveSuccess={fetchSessions} // 儲存成功後重新載入
          />
        ))}
      </Stack>
    </Stack>
  );
}
