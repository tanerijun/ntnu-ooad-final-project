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

export interface StudyActivityProps {
  sx?: SxProps;
}

export function StudyActivity({ sx }: StudyActivityProps): React.JSX.Element {
  const theme = useTheme();
  const [chartSeries, setChartSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivityData = async () => {
      try {
        const notes = await notesClient.getAll();

        // Get last 30 days
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return date;
        });

        // Count notes and updates per day
        const notesPerDay = last30Days.map((date) => {
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const notesCreated = notes.filter((note) => {
            const noteDate = new Date(note.createdAt);
            return noteDate >= dayStart && noteDate <= dayEnd;
          }).length;

          const notesUpdated = notes.filter((note) => {
            const updateDate = new Date(note.updatedAt);
            const createDate = new Date(note.createdAt);
            return updateDate >= dayStart && updateDate <= dayEnd && updateDate.getTime() !== createDate.getTime();
          }).length;

          return { created: notesCreated, updated: notesUpdated };
        });

        setChartSeries([
          {
            name: 'Notes Created',
            data: notesPerDay.map((day) => day.created),
          },
          {
            name: 'Notes Updated',
            data: notesPerDay.map((day) => day.updated),
          },
        ]);
      } catch (error) {
        setChartSeries([]);
      } finally {
        setLoading(false);
      }
    };

    void loadActivityData();
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main],
    dataLabels: { enabled: false },
    fill: { opacity: 1 },
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
        borderRadius: 8,
        columnWidth: '60%',
      },
    },
    stroke: {
      colors: ['transparent'],
      show: true,
      width: 2,
    },
    theme: { mode: theme.palette.mode },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number): string => `${value} note${value !== 1 ? 's' : ''}`,
      },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.getDate().toString();
      }),
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
      title: {
        text: 'Number of Notes',
        style: { color: theme.palette.text.secondary },
      },
    },
  };

  if (loading) {
    return (
      <Card sx={sx}>
        <CardHeader title="Study Activity" subheader="Daily notes creation and updates over the last 30 days" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '200px' }}>
            <Typography color="text.secondary">Loading activity data...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardHeader title="Study Activity" subheader="Daily notes creation and updates over the last 30 days" />
      <CardContent>
        <Chart height={300} options={chartOptions} series={chartSeries} type="bar" width="100%" />
      </CardContent>
    </Card>
  );
}
