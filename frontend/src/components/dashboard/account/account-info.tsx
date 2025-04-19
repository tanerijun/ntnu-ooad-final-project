'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element | null {
  const { user, checkSession } = useUser();
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await apiClient.post('/avatar', formData);

      await checkSession?.();
    } catch (err) {
      setError('Failed to upload avatar');
      logger.error('Failed to upload avatar', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={user.avatarUrl} sx={{ height: '80px', width: '80px' }}>
              <Typography fontSize={36}>{user.name[0].toUpperCase()}</Typography>
            </Avatar>
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user.name}</Typography>
          </Stack>
          {Boolean(error) && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        <Button fullWidth variant="text" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
          {isUploading ? 'Uploading...' : user.avatarUrl ? 'Change picture' : 'Upload picture'}
        </Button>
      </CardActions>
    </Card>
  );
}
