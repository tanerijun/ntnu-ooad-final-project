'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Bookmarks, Plus } from '@phosphor-icons/react';

import { 
  TagManager,
  type TagEventListener,
  type StoredTag
} from '@/lib/tags/storage';

export default function TagNavItem(): React.JSX.Element {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Initialize tag manager and listen for tag updates from other components
  React.useEffect(() => {
    const tagManager = TagManager.getInstance();
    setTags(tagManager.getAllTagSlugs());
    
    const listener: TagEventListener = {
      onTagsUpdated: (updatedTags: StoredTag[]) => {
        setTags(updatedTags.map(tag => tag.slug));
      }
    };
    
    tagManager.addListener(listener);
    
    return () => {
      tagManager.removeListener(listener);
    };
  }, []);

  const handleCreateTag = () => {
    const trimmed = newTagName.trim();
    if (trimmed) {
      const tagManager = TagManager.getInstance();
      const storedTag = tagManager.addTag(trimmed);

      setNewTagName('');
      setAdding(false);
      router.push(`/dashboard/tag/${storedTag.slug}`);
    }
  };

  const handleTagClick = (slug: string) => {
    router.push(`/dashboard/tag/${slug}`);
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
              Tags
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
              placeholder="Enter tag name"
              value={newTagName}
              onChange={(e) => {
                setNewTagName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTag();
                if (e.key === 'Escape') {
                  setNewTagName('');
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

        {/* List of tags */}
        {tags.length > 0 && (
          <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', p: 1, m: 0, width: '100%' }}>
            {tags.map((slug) => (
              <li key={slug} style={{ width: '100%' }}>
                <Button
                  variant="text"
                  onClick={() => {
                    handleTagClick(slug);
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
                  {TagManager.getInstance().slugToName(slug)}
                </Button>
              </li>
            ))}
          </Stack>
        )}
      </Stack>
    </li>
  );
}
