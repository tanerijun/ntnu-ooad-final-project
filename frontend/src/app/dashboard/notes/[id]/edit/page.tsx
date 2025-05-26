'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { FloppyDisk as SaveIcon } from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import { Tag as TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';

import { notesClient, type Note } from '@/lib/notes/client';
import { TagManager, useTagStorageSync, type StoredTag, type TagEventListener } from '@/lib/tags/storage';
import TextEditor from '@/components/dashboard/notes/editor/text-editor';

export default function EditNotePage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const { syncTags } = useTagStorageSync();
  const tagManager = TagManager.getInstance();

  useEffect(() => {
    if (!id) return;

    void (async () => {
      const fetchedNote = await notesClient.get(Number(id));
      if (fetchedNote) {
        setNote(fetchedNote);
        setTitle(fetchedNote.title || '');
        setContent(fetchedNote.content);
        setTags(
          fetchedNote.tags.map((tag) => {
            return tag.name;
          })
        );
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    setAvailableTags(tagManager.getAllTagNames());

    const listener: TagEventListener = {
      onTagsUpdated: (updatedTags: StoredTag[]) => {
        setAvailableTags(updatedTags.map((tag) => tag.name));
      },
    };

    tagManager.addListener(listener);

    return () => {
      tagManager.removeListener(listener);
    };
  }, [tagManager]);

  const handleSave = async () => {
    if (!note) return;

    setSaving(true);
    try {
      const updatedNote = await notesClient.update(note.id, title || null, content, tags);
      if (updatedNote) {
        syncTags(tags);
        setNote(updatedNote);
        router.push('/dashboard/notes');
      } else {
        alert('Failed to save note.');
      }
    } catch (err) {
      alert('Failed to save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleTagAdd = (newTag: string) => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(
      tags.filter((tag) => {
        return tag !== tagToRemove;
      })
    );
  };

  const handleBack = () => {
    router.push('/dashboard/notes');
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '400px' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!note) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ mt: 4 }}>
        <Typography variant="h6">Note not found.</Typography>
        <Button variant="outlined" onClick={handleBack}>
          Back to Notes
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ maxWidth: '100%', px: 2, py: 1 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton onClick={handleBack} size="small">
          <ArrowLeftIcon />
        </IconButton>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Edit Note
        </Typography>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Stack>

      {/* Title Input */}
      <TextField
        label="Note Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        placeholder="Enter a title for your note..."
        InputLabelProps={{ shrink: true }}
      />

      {/* Tags Section */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TagIcon size={20} />
            <Typography variant="subtitle2" fontWeight="medium">
              Tags
            </Typography>
          </Stack>

          {/* Tag Input */}
          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={tags}
            inputValue={tagInput}
            onInputChange={(_, newInputValue) => {
              setTagInput(newInputValue);
            }}
            onChange={(_, newValue) => {
              const newTags = newValue
                .map((tag) => {
                  return typeof tag === 'string' ? tag.trim().toLowerCase() : tag;
                })
                .filter((tag) => {
                  return tag.length > 0;
                });
              setTags([...new Set(newTags)]);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Add tags..."
                variant="outlined"
                size="small"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    handleTagAdd(tagInput);
                  }
                }}
              />
            )}
          />

          {/* Current Tags Display */}
          {tags.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Current tags:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => {
                      handleTagRemove(tag);
                    }}
                    color="primary"
                    variant="filled"
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Content Editor */}
      <Paper variant="outlined" sx={{ minHeight: '400px' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 2 }}>
            Content
          </Typography>
          <TextEditor initialContent={content} onChange={setContent} />
        </Box>
      </Paper>

      {/* Bottom Actions */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pb: 2 }}>
        <Button variant="outlined" onClick={handleBack}>
          Cancel
        </Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>
    </Stack>
  );
}
