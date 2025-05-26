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

export interface TagDistributionProps {
  sx?: SxProps;
}

interface TagCount {
  name: string;
  count: number;
}

export function TagDistribution({ sx }: TagDistributionProps): React.JSX.Element {
  const theme = useTheme();
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTagDistribution = async () => {
      try {
        const notes = await notesClient.getAll();

        const tagCountMap = new Map<string, number>();

        notes.forEach((note) => {
          note.tags.forEach((tag) => {
            const count = tagCountMap.get(tag.name) || 0;
            tagCountMap.set(tag.name, count + 1);
          });
        });

        const tagCountArray = Array.from(tagCountMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10 tags

        setTagCounts(tagCountArray);
      } catch (error) {
        setTagCounts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTagDistribution();
  }, []);

  const chartSeries = tagCounts.map((tag) => tag.count);
  const chartLabels = tagCounts.map((tag) => tag.name);

  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      '#9c27b0',
      '#ff5722',
      '#607d8b',
      '#795548',
    ],
    dataLabels: {
      enabled: true,
      style: {
        colors: [theme.palette.common.white],
        fontSize: '12px',
        fontWeight: 'bold',
      },
      formatter: (val: number): string => `${Math.round(val)}%`,
    },
    labels: chartLabels,
    legend: {
      labels: { colors: theme.palette.text.secondary },
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              show: true,
              color: theme.palette.text.primary,
            },
            value: {
              show: true,
              color: theme.palette.text.secondary,
              formatter: (val: string): string => `${val} notes`,
            },
            total: {
              show: true,
              label: 'Total Notes',
              color: theme.palette.text.primary,
              formatter: (): string => {
                const total = tagCounts.reduce((sum, tag) => sum + tag.count, 0);
                return `${total}`;
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    theme: { mode: theme.palette.mode },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number): string => `${value} note${value !== 1 ? 's' : ''}`,
      },
    },
  };

  if (loading) {
    return (
      <Card sx={sx}>
        <CardHeader title="Tag Distribution" subheader="Most used tags in your notes" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '300px' }}>
            <Typography color="text.secondary">Loading tag distribution...</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (tagCounts.length === 0) {
    return (
      <Card sx={sx}>
        <CardHeader title="Tag Distribution" subheader="Most used tags in your notes" />
        <CardContent>
          <Stack alignItems="center" justifyContent="center" sx={{ height: '300px' }}>
            <Typography color="text.secondary">No tags found. Start adding tags to your notes!</Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={sx}>
      <CardHeader title="Tag Distribution" subheader="Most used tags in your notes" />
      <CardContent>
        <Chart height={350} options={chartOptions} series={chartSeries} type="donut" width="100%" />
      </CardContent>
    </Card>
  );
}
