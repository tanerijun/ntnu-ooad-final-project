'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton, Stack, TextField, Typography } from '@mui/material';

interface TopicNavItemProps {
  title: string;
  icon?: React.ElementType;
}

export default function TopicNavItem({ title, icon: Icon }: TopicNavItemProps): React.JSX.Element {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const handleAddClick = () => {
    setAdding(true);
  };

  const handleCreateTopic = () => {
    if (newTopicName.trim()) {
      const topicSlug = encodeURIComponent(newTopicName.trim().toLowerCase().replace(/\s+/g, '-'));
      setNewTopicName('');
      setAdding(false);
      router.push(`/dashboard/topic/${topicSlug}`);
    }
  };

  return (
    <li>
      <Stack direction="column" spacing={0.5}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 16px',
            borderRadius: 1,
            color: 'var(--NavItem-color)',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'var(--NavItem-hover-background)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Icon ? <Icon fontSize="small" /> : null}
            <Typography variant="body2" fontWeight={500}>
              {title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleAddClick} sx={{ color: 'var(--NavItem-icon-color)' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
        {adding ? <Box sx={{ px: 2 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Enter topic name"
              value={newTopicName}
              onChange={(e) =>{ setNewTopicName(e.target.value)}}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTopic();
              }}
            //   autoFocus
              fullWidth
            />
          </Box> : null}
      </Stack>
    </li>
  );
}
