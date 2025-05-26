'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { CircularProgress, Grid, Stack, Typography } from '@mui/material';

import { logger } from '@/lib/default-logger';
import { notesClient, type Note } from '@/lib/notes/client';
import { AddNoteButton } from '@/components/dashboard/notes/add-note-button';
import { NoteCard } from '@/components/dashboard/notes/note-card';

export default function ClientNotesDashboardPage(): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesClient
      .getAll()
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNotes(sorted);
      })
      .catch((err: unknown) => {
        logger.error('Failed to fetch notes', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Notes
        </Typography>
        <AddNoteButton />
      </Stack>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '200px' }}>
          <CircularProgress />
        </Stack>
      ) : notes.length === 0 ? (
        <Typography variant="body1">No notes found. Click Add to create one.</Typography>
      ) : (
        <Grid container spacing={2}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <NoteCard note={note} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
