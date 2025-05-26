import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { ShowDate } from '@/components/dashboard/timer/show-date';
import { TimerPage } from '@/components/dashboard/timer/timer-page';

export const metadata = { title: `Timer | ${config.site.name}` } satisfies Metadata;

export default function Page() {
  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Timer</Typography>
      </div>
      {/* 顯示今天日期 */}
      <ShowDate />
      {/* 讀書計時器頁面 */}
      <TimerPage />
    </Stack>
  );
}
