'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Stack,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Note as NoteIcon } from '@phosphor-icons/react/dist/ssr/Note';
import { useRouter } from 'next/navigation';

import { notesClient, type Note } from '@/lib/notes/client';
import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await notesClient.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      logger.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void performSearch(query);
      setSelectedIndex(0);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, performSearch]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (results[selectedIndex]) {
          handleNoteClick(results[selectedIndex].id);
        }
        break;
    }
  };

  const handleNoteClick = (noteId: number) => {
    router.push(paths.dashboard.notes.details(noteId));
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    onClose();
  };

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '400px',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid var(--mui-palette-divider)' }}>
          <TextField
            ref={inputRef}
            autoFocus
            fullWidth
            placeholder="Search notes by title, content, or tags..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlassIcon size={20} />
                </InputAdornment>
              ),
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '1.1rem',
              },
            }}
          />
        </Box>

        <Box sx={{ minHeight: '300px', maxHeight: '400px', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : query && results.length === 0 && !loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No notes found for &quot;{query}&quot;
              </Typography>
            </Box>
          ) : !query ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Start typing to search your notes...
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {results.map((note, index) => (
                <ListItem key={note.id} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleNoteClick(note.id);
                    }}
                    selected={index === selectedIndex}
                    sx={{
                      px: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: 'var(--mui-palette-action-hover)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'var(--mui-palette-action-selected)',
                        '&:hover': {
                          backgroundColor: 'var(--mui-palette-action-selected)',
                        },
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, color: 'text.secondary' }}>
                      <NoteIcon size={20} />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {note.title || 'Untitled Note'}
                        </Typography>
                      }
                      secondary={
                        <Stack spacing={1}>
                          {Boolean(note.content) && (
                            <Typography variant="body2" color="text.secondary">
                              {truncateText(note.content)}
                            </Typography>
                          )}
                          {note.tags.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                              {note.tags.map((tag) => {
                                return (
                                <Chip
                                  key={tag.id}
                                  label={tag.name}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem', height: '20px' }}
                                />
                                );
                              })}
                            </Stack>
                          )}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}