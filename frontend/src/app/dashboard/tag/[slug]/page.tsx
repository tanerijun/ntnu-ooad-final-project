'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Button,
} from '@mui/material';

import { notesClient, type Note } from '@/lib/notes/client';
import { logger } from '@/lib/default-logger';

export default function TagNotesPage(): React.JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesClient
      .getAll()
      .then((data) => {
        const filtered = data
          .filter((note) => note.tags.some((tag) => tag.name === slug))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setNotes(filtered);
      })
      .catch((err: unknown) => {logger.error('Failed to fetch tag notes', err)})
      .finally(() => {setLoading(false)});
  }, [slug]);

  const handleNoteClick = (id: number) => {
    router.push(`/dashboard/notes/${id}/edit`);
  };

  const handleAddNote = async () => {
    const newNote = await notesClient.create([slug]);
    if (newNote) {
      router.push(`/dashboard/notes/${newNote.id}/edit`);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Tag: {decodeURIComponent(slug)}
        </Typography>
        <Button variant="contained" onClick={handleAddNote}>
          Add Note
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : notes.length === 0 ? (
        <Typography variant="body1">No notes found for this tag.</Typography>
      ) : (
        <Grid container spacing={2}>
          {notes.map((note) => (
            <Grid item xs={12} sm={6} md={4} key={note.id}>
              <Card>
                <CardActionArea onClick={() => {handleNoteClick(note.id)}}>
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