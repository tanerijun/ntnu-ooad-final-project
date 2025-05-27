'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';

import { notesClient, type Note } from '@/lib/notes/client';
import { TagManager, type StoredTag } from '@/lib/tags/storage';

export interface StudyProgressProps {
  sx?: SxProps;
  targetNotesPerWeek?: number;
}

export function StudyProgress({ sx, targetNotesPerWeek = 10 }: StudyProgressProps): React.JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<StoredTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const tagManager = TagManager.getInstance();

        if (!tagManager.isReady()) {
          await tagManager.refresh();
        }

        const [notesData, tagsData] = await Promise.all([
          notesClient.getAll(),
          Promise.resolve(tagManager.getAllTags()),
        ]);

        setNotes(notesData);
        setTags(tagsData);
      } catch (error) {
        setNotes([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    void loadProgressData();
  }, []);

  if (loading) {
    return (
      <Card sx={sx}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="overline">
                  Study Progress
                </Typography>
                <Typography variant="h4">...</Typography>
              </Stack>
              <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
                <TrendUpIcon fontSize="var(--icon-fontSize-lg)" />
              </Avatar>
            </Stack>
            <LinearProgress value={0} variant="determinate" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Calculate notes created this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const notesThisWeek = notes.filter((note) => {
    const noteDate = new Date(note.createdAt);
    return noteDate >= weekStart;
  }).length;

  const progress = Math.min((notesThisWeek / targetNotesPerWeek) * 100, 100);
  const progressColor = progress >= 100 ? 'success' : progress >= 70 ? 'warning' : 'primary';

  // Calculate study consistency (days with activity this week)
  const daysWithActivity = new Set();
  notes.forEach((note) => {
    const noteDate = new Date(note.createdAt);
    if (noteDate >= weekStart) {
      daysWithActivity.add(noteDate.toDateString());
    }
  });

  const activeDays = daysWithActivity.size;
  const currentDay = new Date().getDay() + 1; // Include today
  const consistencyPercentage = Math.round((activeDays / Math.min(currentDay, 7)) * 100);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Weekly Study Goal
              </Typography>
              <Typography variant="h4">
                {notesThisWeek}/{targetNotesPerWeek}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                notes created this week
              </Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <TrendUpIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color={`${progressColor}.main`} fontWeight="medium">
                {Math.round(progress)}%
              </Typography>
            </Stack>
            <LinearProgress
              value={progress}
              variant="determinate"
              color={progressColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Stack>

          <Stack direction="row" spacing={3}>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ClockIcon fontSize="var(--icon-fontSize-sm)" color="var(--mui-palette-text-secondary)" />
                <Typography variant="body2" color="text.secondary">
                  Study Consistency
                </Typography>
              </Stack>
              <Typography variant="h6" color={consistencyPercentage >= 70 ? 'success.main' : 'text.primary'}>
                {consistencyPercentage}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeDays} active day{activeDays !== 1 ? 's' : ''} this week
              </Typography>
            </Stack>

            <Stack spacing={1} sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Tags
              </Typography>
              <Typography variant="h6">{tags.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                topic{tags.length !== 1 ? 's' : ''} explored
              </Typography>
            </Stack>
          </Stack>

          {progress >= 100 && (
            <Stack
              sx={{
                backgroundColor: 'success.light',
                borderRadius: 1,
                p: 1.5,
                border: '1px solid',
                borderColor: 'success.main',
              }}
            >
              <Typography variant="body2" color="success.dark" fontWeight="medium">
                🎉 Congratulations! You&apos;ve reached your weekly goal!
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
