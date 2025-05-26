'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { PencilSimple as EditIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';

import { notesClient, type Note } from '@/lib/notes/client';

export interface RecentNotesProps {
  sx?: SxProps;
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

export function RecentNotes({ sx }: RecentNotesProps): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    notesClient
      .getAll()
      .then((data) => {
        const sorted = data
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        setNotes(sorted);
      })
      .catch(() => {
        setNotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleEditNote = (noteId: number) => {
    router.push(`/dashboard/notes/${noteId}/edit`);
  };

  if (loading) {
    return (
      <Card sx={sx}>
        <CardHeader title="Recent Notes" subheader="Your most recently updated notes" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '200px' }}>
            <Typography color="text.secondary">Loading recent notes...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (notes.length === 0) {
    return (
      <Card sx={sx}>
        <CardHeader title="Recent Notes" subheader="Your most recently updated notes" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '200px' }}>
            <Typography color="text.secondary">No notes found. Create your first note!</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardHeader title="Recent Notes" subheader="Your most recently updated notes" />
      <CardContent sx={{ px: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Preview</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map((note) => (
              <TableRow hover key={note.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {note.title || `Note #${note.id}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {extractPlainText(note.content) || 'Empty note'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {note.tags.slice(0, 2).map((tag) => (
                      <Chip
                        key={tag.id}
                        label={tag.name}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: '20px' }}
                      />
                    ))}
                    {note.tags.length > 2 && (
                      <Chip
                        label={`+${note.tags.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem', height: '20px' }}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      handleEditNote(note.id);
                    }}
                  >
                    <EditIcon fontSize="var(--icon-fontSize-md)" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
