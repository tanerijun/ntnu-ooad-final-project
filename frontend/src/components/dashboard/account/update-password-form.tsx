'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';

const schema = zod
  .object({
    currentPassword: zod.string().min(1, 'Current password is required'),
    newPassword: zod.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = zod.infer<typeof schema>;

export function UpdatePasswordForm(): React.JSX.Element {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const { error } = await authClient.updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (error) {
      setSubmitError(error);
      setIsSubmitting(false);
      return;
    }

    setSubmitSuccess(true);
    setIsSubmitting(false);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader subheader="Update your password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field }) => (
                <FormControl error={Boolean(errors.currentPassword)} fullWidth>
                  <InputLabel>Current Password</InputLabel>
                  <OutlinedInput {...field} label="Current Password" type="password" />
                  {Boolean(errors.currentPassword) && (
                    <FormHelperText>{errors.currentPassword!.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="newPassword"
              render={({ field }) => (
                <FormControl error={Boolean(errors.newPassword)} fullWidth>
                  <InputLabel>New Password</InputLabel>
                  <OutlinedInput {...field} label="New Password" type="password" />
                  {Boolean(errors.newPassword) && <FormHelperText>{errors.newPassword!.message}</FormHelperText>}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormControl error={Boolean(errors.confirmPassword)} fullWidth>
                  <InputLabel>Confirm Password</InputLabel>
                  <OutlinedInput {...field} label="Confirm Password" type="password" />
                  {Boolean(errors.confirmPassword) && (
                    <FormHelperText>{errors.confirmPassword!.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Stack>
          {Boolean(submitError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
          {Boolean(submitSuccess) && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password updated successfully
            </Alert>
          )}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
