'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import { notesClient, Note } from '@/lib/notes/client';
import TextEditor from '@/components/dashboard/notes/editor/text-editor';

export default function EditNotePage(): React.JSX.Element {
  const { id } = useParams();
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>('');
  
  useEffect(() => {
    if (!id) return;
  
    void (async () => {
      const fetchedNote = await notesClient.get(Number(id));
      if (fetchedNote) {
        setNote(fetchedNote);
        setContent(fetchedNote.content);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    if (!note) return;
    try {
      await notesClient.update(note.id, content);
      // alert('Note saved!');
      router.push('/dashboard/notes');  // OR update `setNote(updated)` if you want to stay on the page
    } catch (err) {
      alert('Failed to save note.');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!note) {
    return <Typography>Note not found.</Typography>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Edit Note #{note.id}</Typography>
      <TextEditor initialContent={content} onChange={setContent} />
      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Stack>
  );
}