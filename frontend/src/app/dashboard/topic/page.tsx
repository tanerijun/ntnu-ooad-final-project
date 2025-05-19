import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TopicNavItem from '@/components/dashboard/topic/topic-nav';

export default function TestTopicNavPage(): React.JSX.Element {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test TopicNavItem
      </Typography>
      <TopicNavItem />
    </Box>
  );
}