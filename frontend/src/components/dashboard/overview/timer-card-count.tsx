'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { TimerCard } from '@/components/dashboard/overview/timer-card';
import { timerSessionsClient } from '@/lib/timer/client';

export function TimerCardCount(): React.JSX.Element {
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  useEffect(() => {
    const fetchTotalTime = async () => {
      try {
        const sessions = await timerSessionsClient.fetchTodayTasks();
        const total = sessions.reduce((sum, session) => sum + session.duration, 0);
        setTotalSeconds(total);
      } catch (err) {
        console.error('Failed to fetch timer sessions:', err);
      }
    };

    void fetchTotalTime();
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TimerCard
      diff={16}
      trend="up"
      sx={{ height: '100%', backgroundColor: '#e3f2ff' }}
      value={formatTime(totalSeconds)}
    />
  );
}
