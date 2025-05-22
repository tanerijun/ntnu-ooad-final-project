'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { logger } from '@/lib/default-logger';
import { timerSessionsClient } from '@/lib/timer/client';

interface StudyTaskCardProps {
  isRunning: boolean;
  onRequestStart: (taskState: boolean) => void;
  taskId: number; // 必須有 taskId 才能更新正確的資料
  subjectName: string;
  initialDuration: number;
  onTimeUpdate: (seconds: number) => void;
  onSaveSuccess?: () => void; // 可選，保存成功時通知父元件
}

export function StudyTaskCard({
  isRunning,
  taskId,
  subjectName,
  initialDuration,
  onRequestStart,
  onTimeUpdate,
  onSaveSuccess,
}: StudyTaskCardProps): React.JSX.Element {
  const [elapsedTime, setElapsedTime] = useState(initialDuration);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // 新增隱藏任務的狀態
  const [hideError, setHideError] = useState<string | null>(null);

  // 隱藏任務的處理函式
  const handleHide = async () => {
    setHideError(null);
    const result = await timerSessionsClient.hideTask(subjectName);
    if (result.success) {
      // 通知父元件刷新列表
      onSaveSuccess?.();
    } else {
      setHideError('隱藏失敗，請稍後再試');
    }
  };
  // 保存到資料庫
  const saveDuration = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await timerSessionsClient.update(taskId, { duration: elapsedTime });
      onSaveSuccess?.();
    } catch (err) {
      setSaveError('自動保存失敗，請檢查網路連線');
      logger.error('自動保存失敗:', err);
    } finally {
      setIsSaving(false);
    }
  }, [taskId, elapsedTime, onSaveSuccess]);

  // 每秒累加計時
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isRunning]);

  // 每30秒自動保存
  useEffect(() => {
    logger.debug('計時器啟動', isRunning);
    if (!isRunning) return;
    const autoSaveTimer = setInterval(() => {
      void saveDuration();
      logger.debug('自動保存計時');
    }, 30000); // 30秒
    return () => {
      clearInterval(autoSaveTimer);
    };
  }, [isRunning]);

  // 暫停時立即保存
  const handleToggle = async () => {
    if (isRunning) {
      logger.debug('暫停計時');
      await saveDuration();
      onRequestStart(false); // 這樣即可
    }
  };

  // 每次 elapsedTime 變動時通知外部
  useEffect(() => {
    onTimeUpdate(elapsedTime);
  }, [elapsedTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        position: 'relative',
        transition: 'all 0.3s ease',
        boxShadow: isRunning ? 4 : 1,
        border: '1px solid',
        borderColor: isRunning ? 'primary.main' : 'transparent',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        {/* 右上角叉叉 */}
        <IconButton aria-label="隱藏" onClick={handleHide} sx={{ position: 'absolute', top: 8, right: 8 }} size="small">
          <XIcon />
        </IconButton>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            {subjectName || '未命名科目'}
          </Typography>

          <Typography
            variant="h4"
            align="center"
            sx={{
              fontFamily: 'monospace',
              color: isRunning ? 'primary.main' : 'text.primary',
              fontWeight: 'bold',
            }}
          >
            {formatTime(elapsedTime)}
          </Typography>

          {/* ...原本的 Button 和內容 ... */}
          <LoadingButton
            variant="contained"
            color={isRunning ? 'warning' : 'success'}
            onClick={() => {
              if (!isRunning) {
                onRequestStart(true);
              } else {
                void handleToggle();
              }
            }}
            disabled={isSaving}
            loading={isSaving}
            fullWidth
            sx={{ mt: 1 }}
          >
            {isRunning ? '暫停' : '開始'}
          </LoadingButton>

          {saveError || hideError ? (
            <Typography color="error" variant="caption" align="center">
              {saveError || hideError}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
