'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Tag as TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';

import { TagManager, type StoredTag, type TagEventListener } from '@/lib/tags/storage';

export interface TagsStatsProps {
  sx?: SxProps;
}

export function TagsStats({ sx }: TagsStatsProps): React.JSX.Element {
  const [tags, setTags] = useState<StoredTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tagManager = TagManager.getInstance();
    
    const loadTags = async () => {
      if (!tagManager.isReady()) {
        await tagManager.refresh();
      }
      setTags(tagManager.getAllTags());
      setLoading(false);
    };

    const listener: TagEventListener = {
      onTagsUpdated: (updatedTags: StoredTag[]) => {
        setTags(updatedTags);
        setLoading(false);
      },
    };

    tagManager.addListener(listener);
    void loadTags();

    return () => {
      tagManager.removeListener(listener);
    };
  }, []);

  if (loading) {
    return (
      <Card sx={sx}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="overline">
                  Total Tags
                </Typography>
                <Typography variant="h4">...</Typography>
              </Stack>
              <Avatar sx={{ backgroundColor: 'var(--mui-palette-secondary-main)', height: '56px', width: '56px' }}>
                <TagIcon fontSize="var(--icon-fontSize-lg)" />
              </Avatar>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const totalTags = tags.length;
  const tagsThisWeek = tags.filter((tag) => {
    const tagDate = new Date(tag.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return tagDate >= weekAgo;
  }).length;

  const tagsLastWeek = tags.filter((tag) => {
    const tagDate = new Date(tag.createdAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return tagDate >= twoWeeksAgo && tagDate < weekAgo;
  }).length;

  const diff =
    tagsLastWeek === 0
      ? tagsThisWeek > 0
        ? 100
        : 0
      : Math.round(((tagsThisWeek - tagsLastWeek) / tagsLastWeek) * 100);
  const trend = diff >= 0 ? 'up' : 'down';
  const TrendIcon = trend === 'up' ? TrendUpIcon : TrendDownIcon;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Tags
              </Typography>
              <Typography variant="h4">{totalTags}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-secondary-main)', height: '56px', width: '56px' }}>
              <TagIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {(tagsThisWeek > 0 || tagsLastWeek > 0) && (
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
                Since last week ({tagsThisWeek} new)
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
