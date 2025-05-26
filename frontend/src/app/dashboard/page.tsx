import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { config } from '@/config';
import { ContentAnalytics } from '@/components/dashboard/overview/content-analytics';
import { NotesStats } from '@/components/dashboard/overview/notes-stats';
import { RecentNotes } from '@/components/dashboard/overview/recent-notes';
import { StudyActivity } from '@/components/dashboard/overview/study-activity';
import { StudyProgress } from '@/components/dashboard/overview/study-progress';
import { TagDistribution } from '@/components/dashboard/overview/tag-distribution';
import { TagsStats } from '@/components/dashboard/overview/tags-stats';

export const metadata = { title: `Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack gap={3}>
      <Typography variant="h4" component="h1">
        Statistics
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Track your learning progress and note-taking activity
      </Typography>

      <Grid container spacing={3}>
        {/* Top Row - Key Metrics */}
        <Grid lg={3} sm={6} xs={12}>
          <NotesStats sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={3} sm={6} xs={12}>
          <TagsStats sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={6} xs={12}>
          <StudyProgress sx={{ height: '100%' }} targetNotesPerWeek={15} />
        </Grid>

        {/* Second Row - Activity Charts */}
        <Grid lg={8} xs={12}>
          <StudyActivity sx={{ height: '100%' }} />
        </Grid>
        <Grid lg={4} md={6} xs={12}>
          <TagDistribution sx={{ height: '100%' }} />
        </Grid>

        {/* Third Row - Content Analytics */}
        <Grid lg={12} xs={12}>
          <ContentAnalytics sx={{ height: '100%' }} />
        </Grid>

        {/* Fourth Row - Recent Activity */}
        <Grid lg={12} md={12} xs={12}>
          <RecentNotes sx={{ height: '100%' }} />
        </Grid>
      </Grid>
    </Stack>
  );
}
