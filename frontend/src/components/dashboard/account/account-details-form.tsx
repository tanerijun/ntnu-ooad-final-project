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
import Grid from '@mui/material/Unstable_Grid2';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export function AccountDetailsForm(): React.JSX.Element | null {
  const { user, checkSession } = useUser();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const { error } = await authClient.updateProfile(data);

    if (error) {
      setSubmitError(error);
      setIsSubmitting(false);
      return;
    }

    // Refresh user data
    await checkSession?.();
    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader subheader="Update your account information" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.name)}>
                    <InputLabel>Name</InputLabel>
                    <OutlinedInput {...field} label="Name" />
                    {Boolean(errors.name) && <FormHelperText>{errors.name!.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid md={6} xs={12}>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.email)}>
                    <InputLabel>Email</InputLabel>
                    <OutlinedInput {...field} label="Email" />
                    {Boolean(errors.email) && <FormHelperText>{errors.email!.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
          {Boolean(submitError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
          {Boolean(submitSuccess) && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Profile updated successfully
            </Alert>
          )}
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button disabled={isSubmitting} type="submit" variant="contained">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
