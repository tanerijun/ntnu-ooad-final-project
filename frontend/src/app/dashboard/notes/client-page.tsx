'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardActionArea, CardContent, CircularProgress, Grid, Stack, Typography, Chip, Box } from '@mui/material';

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
        <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '200px' }}>
          <CircularProgress />
        </Stack>
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
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      {note.title || `Note #${note.id}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '2.5em', overflow: 'hidden' }}>
                      {extractPlainText(note.content) || 'Empty note'}
                    </Typography>
                    
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 ? (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {note.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag.id}
                              label={tag.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: '20px' }}
                            />
                          ))}
                          {note.tags.length > 3 ? (
                            <Chip
                              label={`+${note.tags.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem', height: '20px' }}
                            />
                          ) : null}
                        </Stack>
                      </Box>
                    ) : null}
                    
                    <Typography variant="caption" color="text.secondary">
                      Updated {new Date(note.updatedAt).toLocaleDateString()} at {new Date(note.updatedAt).toLocaleTimeString()}
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
