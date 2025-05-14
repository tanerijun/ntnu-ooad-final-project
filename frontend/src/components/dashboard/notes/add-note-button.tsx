'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { notesClient } from '@/lib/notes/client';

export function AddNoteButton(): React.JSX.Element {
  const router = useRouter();

  const handleAdd = async () => {
    const note = await notesClient.create();
    if (note) {
      router.push(`/dashboard/notes/${note.id}/edit`);
    } else {
      alert('Failed to create note.');
    }
  };

  return (
    <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleAdd}>
      Add
    </Button>
  );
}
