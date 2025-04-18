'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

export function AddNoteButton(): React.JSX.Element {
  return (
    <Button
      startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
      variant="contained"
      onClick={() => {
        alert('TODO');
      }}
    >
      Add
    </Button>
  );
}
