import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { AddNoteButton } from '@/components/dashboard/notes/add-note-button';

export const metadata = { title: `Notes | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Notes</Typography>
        </Stack>
        <div>
          <AddNoteButton />
        </div>
      </Stack>
      <Typography variant="body1">TODO: Show all notes</Typography>
      <Typography variant="body1">TODO: On &apos;Add&apos; button click, redirect to new note page</Typography>
    </Stack>
  );
}
