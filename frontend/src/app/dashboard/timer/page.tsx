import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { AddTimerButton } from '@/components/dashboard/timer/add-timer-button';

export const metadata = { title: `Timer | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Timer</Typography>
        </Stack>
        <div>
          <AddTimerButton />
        </div>
      </Stack>
      <Typography variant="body1">TODO: implement timer related features</Typography>
    </Stack>
  );
}
