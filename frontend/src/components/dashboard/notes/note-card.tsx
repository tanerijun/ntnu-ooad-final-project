import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';

import type { Note } from '@/lib/notes/client';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps): React.JSX.Element {
  const router = useRouter();

  const handleNoteClick = () => {
    router.push(`/dashboard/notes/${note.id}/edit`);
  };

  return (
    <Card>
      <CardActionArea onClick={handleNoteClick}>
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
