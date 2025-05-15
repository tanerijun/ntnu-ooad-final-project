'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardActionArea, CardContent, CircularProgress, Grid, Stack, Typography } from '@mui/material';

import { logger } from '@/lib/default-logger';
import { notesClient, type Note } from '@/lib/notes/client';
import { AddNoteButton } from '@/components/dashboard/notes/add-note-button';

export default function ClientNotesDashboardPage(): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleNoteClick = (id: number) => {
    router.push(`/dashboard/notes/${id}/edit`);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Notes
        </Typography>
        <AddNoteButton />
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : notes.length === 0 ? (
        <Typography variant="body1">No notes found. Click Add to create one.</Typography>
      ) : (
        <Grid container spacing={2}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card>
                <CardActionArea
                  onClick={() => {
                    handleNoteClick(note.id);
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Note #{note.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {extractPlainText(note.content) || 'Empty note'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated at {new Date(note.updatedAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

function extractPlainText(content: string): string {
  try {
    const parsed = JSON.parse(content);
    const root = parsed?.root;
    const firstParagraph = root?.children?.[0];
    const text = firstParagraph?.children?.[0]?.text;
    return typeof text === 'string' ? text : '';
  } catch {
    return '';
  }
}
