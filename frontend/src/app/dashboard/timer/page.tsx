import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';

import { config } from '@/config';
import { ShowDate } from '@/components/dashboard/timer/show-date';
import { TimerPage } from '@/components/dashboard/timer/timer-page';

export const metadata = { title: `Timer | ${config.site.name}` } satisfies Metadata;

export default function Page() {
  return (
    <Stack spacing={4} alignItems="center" paddingTop={4}>
      {/* 顯示今天日期 */}
      <ShowDate />
      {/* 讀書計時器頁面 */}
      <TimerPage />
    </Stack>
  );
}
