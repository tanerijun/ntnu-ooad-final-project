'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function ShowDate(): React.JSX.Element {
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box textAlign="center">
      <Typography variant="h5" component="div" color="text.primary">
        {currentDate}
      </Typography>
    </Box>
  );
}
