'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

export function AddNoteButton(): React.JSX.Element {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/notes/new');
  };

  return (
    <Button
      startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
      variant="contained"
      onClick={handleClick}
    >
      Add
    </Button>
  );
}