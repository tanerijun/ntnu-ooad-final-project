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
    <li style={{ width: '100%' }}>
      <Stack
        direction="column"
        spacing={0.5}
        sx={{
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Header with Add button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            color: 'var(--NavItem-color)',
            cursor: 'pointer',
            width: '100%',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Bookmarks fontSize="var(--icon-fontSize-md)" weight="regular" fill="var(--NavItem-icon-color)" />
            <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: '28px' }}>
              Topics
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setAdding((v) => !v);
            }}
            sx={{
              color: 'var(--NavItem-icon-color)',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            <Plus fontSize="small" />
          </IconButton>
        </Box>

        {/* Text input when adding */}
        {adding ? (
          <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
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
              autoFocus
              InputProps={{
                sx: {
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.6)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                },
              }}
            />
          </Box>
        ) : null}

        {/* List of topics */}
        {topics.length > 0 && (
          <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', p: 1, m: 0, width: '100%' }}>
            {topics.map((slug) => (
              <li key={slug} style={{ width: '100%' }}>
                <Button
                  variant="text"
                  onClick={() => {
                    handleTopicClick(slug);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    width: '100%',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease',
                    },
                  }}
                >
                  {decodeURIComponent(slug)}
                </Button>
              </li>
            ))}
          </Stack>
        )}
      </Stack>
    </li>
  );
}
