'use client';

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { AddTimerButton } from '@/components/dashboard/timer/add-timer-button';
import { ShowDate } from '@/components/dashboard/timer/show-date';
import StudyTaskCard from '@/components/dashboard/timer/study-task-card';

interface Task {
  id: number;
  subject: string;
}

export default function TimerPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, subject: '數學' },
    { id: 2, subject: '英文' },
  ]);

  const [timeRecords, setTimeRecords] = useState<{ [id: number]: number }>({});

  const handleTimeUpdate = (id: number, seconds: number) => {
    setTimeRecords((prev) => ({
      ...prev,
      [id]: seconds,
    }));
  };

  const totalStudyTime = Object.values(timeRecords).reduce((sum, sec) => sum + sec, 0);

  return (
    <Stack spacing={4} alignItems="center" paddingTop={4}>
      {/* 顯示今天日期 */}
      <ShowDate />

      {/* 顯示總讀書時間 */}
      <Typography variant="h5" fontWeight="bold">
        📚 今日累積讀書時間：{Math.floor(totalStudyTime / 60)}分{totalStudyTime % 60}秒
      </Typography>

      {/* 新增計時器按鈕 */}
      <AddTimerButton />

      {/* 讀書卡片列表 */}
      <Stack spacing={3} width="100%" alignItems="center">
        {tasks.map((task) => (
          <StudyTaskCard
            key={task.id}
            subjectName={task.subject}
            onTimeUpdate={(seconds) => handleTimeUpdate(task.id, seconds)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
