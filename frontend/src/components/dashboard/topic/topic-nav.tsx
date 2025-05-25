'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Bookmarks, Plus } from '@phosphor-icons/react';

// For persistence in-memory (optional: replace with backend/localStorage later)
const localTopicKey = '__local_topics__';

function loadTopics(): string[] {
  try {
    const stored = localStorage.getItem(localTopicKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTopics(topics: string[]) {
  localStorage.setItem(localTopicKey, JSON.stringify(topics));
}

export default function TopicNavItem(): React.JSX.Element {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [topics, setTopics] = useState<string[]>(loadTopics());

  const handleCreateTopic = () => {
    const trimmed = newTopicName.trim();
    if (trimmed) {
      const topicSlug = encodeURIComponent(trimmed.toLowerCase().replace(/\s+/g, '-'));

      // Add new topic if not duplicate
      if (!topics.includes(topicSlug)) {
        const updated = [...topics, topicSlug];
        setTopics(updated);
        saveTopics(updated);
      }

      setNewTopicName('');
      setAdding(false);
      router.push(`/dashboard/topic/${topicSlug}`);
    }
  };

  const handleTopicClick = (slug: string) => {
    router.push(`/dashboard/topic/${slug}`);
  };

  return (
    <li>
      <Stack direction="column" spacing={0.5}>
        {/* Header with Add button */}
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
            <Bookmarks fontSize="var(--icon-fontSize-md)" weight="regular" fill="var(--NavItem-icon-color)" />
            <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}>
              Topic
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setAdding((v) => !v);
            }}
            sx={{ color: 'var(--NavItem-icon-color)' }}
          >
            <Plus fontSize="small" />
          </IconButton>
        </Box>

        {/* Text input when adding */}
        {adding ? (
          <Box sx={{ px: 2 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Enter topic name"
              value={newTopicName}
              onChange={(e) => {
                setNewTopicName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTopic();
                if (e.key === 'Escape') {
                  setNewTopicName('');
                  setAdding(false);
                }
              }}
              fullWidth
              InputProps={{
                sx: {
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                  },
                },
              }}
            />
          </Box>
        ) : null}

        {/* List of topics */}
        <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', pl: 3, pt: 1 }}>
          {topics.map((slug) => (
            <li key={slug}>
              <Button
                variant="text"
                onClick={() => {
                  handleTopicClick(slug);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  color: 'var(--NavItem-color)',
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  minWidth: 0,
                  px: 1,
                }}
              >
                {decodeURIComponent(slug)}
              </Button>
            </li>
          ))}
        </Stack>
      </Stack>
    </li>
  );
}
