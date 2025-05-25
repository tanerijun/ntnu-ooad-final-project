'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { notesClient } from '@/lib/notes/client';
import { NoteCard } from '@/components/dashboard/overview/note-card';

export function NoteCardCount(): React.JSX.Element {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    async function fetchNoteCount() {
      try {
        const notes = await notesClient.getAll();
        setCount(notes.length);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      }
    }

    void fetchNoteCount();
  }, []);

  return (
    <NoteCard
      diff={12}
      trend="up"
      sx={{ height: '100%', backgroundColor: '#e3f2ff' }}
      value={`${count}`}
    />
  );
}
