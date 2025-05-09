'use client';
import * as React from 'react';
import { Stack, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import TextEditor from '@/components/dashboard/notes/editor/text-editor'; // (You will create this next)

export default function NewNotePage(): React.JSX.Element {
  const _router = useRouter();

  const handleSave = () => {
    // TODO: Save content to backend
    // router.push('/dashboard/notes');  // Navigate back to notes page after save
    alert('TODO: Save note content');
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">New Note</Typography>
      <TextEditor />
      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Stack>
  );
}