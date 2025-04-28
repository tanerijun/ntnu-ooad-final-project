'use client';

import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export function ShowDate(): React.JSX.Element {
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Box textAlign="center" mt={2}>
      <Typography variant="h3" component="div" style={{ color: 'black' }}>
        {currentDate}
      </Typography>
    </Box>
  );
}