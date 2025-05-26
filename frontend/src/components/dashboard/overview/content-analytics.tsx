'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ApexOptions } from 'apexcharts';

import { notesClient } from '@/lib/notes/client';
import { Chart } from '@/components/core/chart';

export interface ContentAnalyticsProps {
  sx?: SxProps;
}

interface WeeklyData {
  week: string;
  notesCreated: number;
  wordsWritten: number;
  tagsUsed: number;
}

function extractWordCount(content: string): number {
  try {
    const parsed = JSON.parse(content);
    const extractText = (node: unknown): string => {
      if (typeof node === 'string') return node;
      if (node && typeof node === 'object' && 'text' in node) return String(node.text);
      if (
        node &&
        typeof node === 'object' &&
        'children' in node &&
        Array.isArray((node as { children: unknown[] }).children)
      ) {
        return (node as { children: unknown[] }).children.map(extractText).join(' ');
      }
      return '';
    };

    const text = extractText(parsed.root || parsed);
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  } catch {
    return 0;
  }
}

export function ContentAnalytics({ sx }: ContentAnalyticsProps): React.JSX.Element {
  const theme = useTheme();
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const notes = await notesClient.getAll();

        // Get last 8 weeks of data
        const weeks = Array.from({ length: 8 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 7 * (7 - i));
          const weekStart = new Date(date);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return weekStart;
        });

        const analyticsData = weeks.map((weekStart) => {
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

          const weekNotes = notes.filter((note) => {
            const noteDate = new Date(note.createdAt);
            return noteDate >= weekStart && noteDate < weekEnd;
          });

          const notesCreated = weekNotes.length;
          const wordsWritten = weekNotes.reduce((total, note) => {
            return total + extractWordCount(note.content);
          }, 0);

          const uniqueTags = new Set();
          weekNotes.forEach((note) => {
            note.tags.forEach((tag) => uniqueTags.add(tag.name));
          });
          const tagsUsed = uniqueTags.size;

          return {
            week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
            notesCreated,
            wordsWritten,
            tagsUsed,
          };
        });

        setWeeklyData(analyticsData);
      } catch (error) {
        setWeeklyData([]);
      } finally {
        setLoading(false);
      }
    };

    void loadAnalyticsData();
  }, []);

  const chartSeries = [
    {
      name: 'Notes Created',
      type: 'column',
      data: weeklyData.map((week) => week.notesCreated),
    },
    {
      name: 'Words Written',
      type: 'line',
      data: weeklyData.map((week) => week.wordsWritten),
    },
    {
      name: 'Tags Used',
      type: 'area',
      data: weeklyData.map((week) => week.tagsUsed),
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main],
    dataLabels: { enabled: false },
    fill: {
      type: ['solid', 'solid', 'gradient'],
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: [theme.palette.info.light],
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.25,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      horizontalAlign: 'right',
      labels: { colors: theme.palette.text.secondary },
      position: 'top',
      itemMargin: { horizontal: 10 },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    stroke: {
      width: [0, 3, 2],
      curve: 'smooth',
    },
    theme: { mode: theme.palette.mode },
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (value: number): string => `${value} note${value !== 1 ? 's' : ''}`,
        },
        {
          formatter: (value: number): string => `${value} word${value !== 1 ? 's' : ''}`,
        },
        {
          formatter: (value: number): string => `${value} tag${value !== 1 ? 's' : ''}`,
        },
      ],
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: weeklyData.map((week) => week.week),
      labels: { style: { colors: theme.palette.text.secondary } },
      title: {
        text: 'Week Starting',
        style: { color: theme.palette.text.secondary },
      },
    },
    yaxis: [
      {
        title: {
          text: 'Notes & Tags',
          style: { color: theme.palette.text.secondary },
        },
        labels: { style: { colors: theme.palette.text.secondary } },
      },
      {
        opposite: true,
        title: {
          text: 'Words Written',
          style: { color: theme.palette.text.secondary },
        },
        labels: { style: { colors: theme.palette.text.secondary } },
      },
    ],
  };

  if (loading) {
    return (
      <Card sx={sx}>
        <CardHeader title="Content Analytics" subheader="Weekly overview of your writing activity" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '300px' }}>
            <Typography color="text.secondary">Loading analytics data...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (weeklyData.length === 0) {
    return (
      <Card sx={sx}>
        <CardHeader title="Content Analytics" subheader="Weekly overview of your writing activity" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '300px' }}>
            <Typography color="text.secondary">No data available. Start creating notes to see analytics!</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const totalNotes = weeklyData.reduce((sum, week) => sum + week.notesCreated, 0);
  const totalWords = weeklyData.reduce((sum, week) => sum + week.wordsWritten, 0);
  const avgWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;

  return (
    <Card sx={sx}>
      <CardHeader title="Content Analytics" subheader="Weekly overview of your writing activity" />
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" spacing={3} justifyContent="space-around">
            <Stack alignItems="center">
              <Typography variant="h6" color="primary.main">
                {totalNotes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Notes
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h6" color="secondary.main">
                {totalWords.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Words Written
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="h6" color="info.main">
                {avgWordsPerNote}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Words/Note
              </Typography>
            </Stack>
          </Stack>
          <Chart height={300} options={chartOptions} series={chartSeries} type="line" width="100%" />
        </Stack>
      </CardContent>
    </Card>
  );
}
