import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import Stack from '@mui/material/Stack';

import { TimerPage } from '@/components/dashboard/timer/timer-page';

import { AddTimerButton } from '@/components/dashboard/timer/add-timer-button';
import { ShowDate } from '@/components/dashboard/timer/show-date';

export const metadata = { title: `Timer | ${config.site.name}` } satisfies Metadata;


export default function Page() {
  return (
    <Stack spacing={4} alignItems="center" paddingTop={4}>
      {/* 顯示今天日期 */}
      <ShowDate />
      {/* 新增計時器按鈕 */}
      <AddTimerButton />
      {/* 讀書計時器頁面 */}
      <TimerPage />
    </Stack>
  );
}