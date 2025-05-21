'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
// Material UI 叉叉 icon
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 400, position: 'relative' }}>
      <CardContent>
        {/* 右上角叉叉 */}
        <IconButton aria-label="隱藏" onClick={handleHide} sx={{ position: 'absolute', top: 8, right: 8 }} size="small">
          <Icon>X</Icon> {/* 這裡的 "close" 就是顯示叉叉 */}
        </IconButton>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* ...原本的 Button 和內容 ... */}
          <Button
            variant="contained"
            color={isRunning ? 'warning' : 'success'}
            onClick={() => {
              if (!isRunning) {
                onRequestStart(true); // 請求啟動，父元件會切換 activeTaskId
              } else {
                void handleToggle(); // 暫停自己
                logger.debug('暫停計時');
              }
            }}
            disabled={isSaving}
            sx={{ minWidth: '60px' }}
          >
            {isSaving ? '保存中...' : isRunning ? '暫停' : '開始'}
          </Button>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight="bold">
              {subjectName || '未命名科目'}
            </Typography>
            <Typography color="text.secondary">專注時間：{formatTime(elapsedTime)}</Typography>
            {saveError ? (
              <Typography color="error" variant="caption">
                {saveError}
              </Typography>
            ) : null}
            {hideError ? (
              <Typography color="error" variant="caption">
                {hideError}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
