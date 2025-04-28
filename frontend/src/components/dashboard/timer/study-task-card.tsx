'use client';

import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface StudyTaskCardProps {
  subjectName: string;
  onTimeUpdate: (seconds: number) => void; // 告訴外面目前累積多少秒
}

export default function StudyTaskCard({
  subjectName,
  onTimeUpdate,
}: StudyTaskCardProps): React.JSX.Element {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    // 每次 elapsedTime 變動，回報給外面
    onTimeUpdate(elapsedTime);
  }, [elapsedTime, onTimeUpdate]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="contained"
            color={isRunning ? 'warning' : 'success'}
            onClick={() => setIsRunning((prev) => !prev)}
            sx={{ minWidth: '60px' }}
          >
            {isRunning ? '暫停' : '開始'}
          </Button>

          <Stack spacing={1}>
            <Typography variant="h6" fontWeight="bold">
              {subjectName || '未命名科目'}
            </Typography>
            <Typography color="text.secondary">
              已讀時間：{formatTime(elapsedTime)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
