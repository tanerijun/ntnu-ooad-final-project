'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Note as NoteIcon } from '@phosphor-icons/react/dist/ssr/Note';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';

import { notesClient, type Note } from '@/lib/notes/client';

export interface NotesStatsProps {
  sx?: SxProps;
}

export function NotesStats({ sx }: NotesStatsProps): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesClient
      .getAll()
      .then((data) => {
        setNotes(data);
      })
      .catch(() => {
        setNotes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card sx={sx}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="overline">
                  Total Notes
                </Typography>
                <Typography variant="h4">...</Typography>
              </Stack>
              <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
                <NoteIcon fontSize="var(--icon-fontSize-lg)" />
              </Avatar>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const totalNotes = notes.length;
  const notesThisWeek = notes.filter((note) => {
    const noteDate = new Date(note.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate >= weekAgo;
  }).length;

  const notesLastWeek = notes.filter((note) => {
    const noteDate = new Date(note.createdAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate >= twoWeeksAgo && noteDate < weekAgo;
  }).length;

  const diff = notesLastWeek === 0 ? 100 : Math.round(((notesThisWeek - notesLastWeek) / notesLastWeek) * 100);
  const trend = diff >= 0 ? 'up' : 'down';
  const TrendIcon = trend === 'up' ? TrendUpIcon : TrendDownIcon;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Notes
              </Typography>
              <Typography variant="h4">{totalNotes}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <NoteIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {(notesThisWeek > 0 || notesLastWeek > 0) && (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon
                  color={trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)'}
                  fontSize="var(--icon-fontSize-md)"
                />
                <Typography color={trend === 'up' ? 'success.main' : 'error.main'} variant="body2">
                  {Math.abs(diff)}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last week ({notesThisWeek} new)
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
