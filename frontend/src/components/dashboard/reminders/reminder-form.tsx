'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import type { Reminder } from '@/types/reminder';

const schema = zod.object({
  title: zod.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: zod.string().max(500, 'Description is too long').optional(),
  date: zod.date({ required_error: 'Date is required' }),
  time: zod.date({ required_error: 'Time is required' }),
});

type Values = zod.infer<typeof schema>;

interface ReminderFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; reminderTime: string }) => Promise<void>;
  reminder?: Reminder;
  isLoading?: boolean;
}

export function ReminderForm({
  open,
  onClose,
  onSubmit,
  reminder,
  isLoading = false,
}: ReminderFormProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      time: new Date(),
    },
  });

  React.useEffect(() => {
    if (reminder) {
      const reminderDateTime = dayjs(reminder.reminderTime);
      reset({
        title: reminder.title,
        description: reminder.description || '',
        date: reminderDateTime.toDate(),
        time: reminderDateTime.toDate(),
      });
    } else {
      const now = dayjs();
      reset({
        title: '',
        description: '',
        date: now.toDate(),
        time: now.toDate(),
      });
    }
  }, [reminder, reset, open]);

  const handleFormSubmit = React.useCallback(
    async (values: Values) => {
      // Combine date and time
      const reminderDateTime = dayjs(values.date)
        .hour(dayjs(values.time).hour())
        .minute(dayjs(values.time).minute())
        .toISOString();

      await onSubmit({
        title: values.title,
        description: values.description,
        reminderTime: reminderDateTime,
      });

      onClose();
      reset();
    },
    [onSubmit, onClose, reset]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>{reminder ? 'Edit Reminder' : 'Add New Reminder'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <FormControl error={Boolean(errors.title)}>
                  <InputLabel>Title</InputLabel>
                  <OutlinedInput {...field} label="Title" />
                  {errors.title ? <FormHelperText>{errors.title.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  multiline
                  rows={3}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                  placeholder="Optional description..."
                />
              )}
            />

            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  label="Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.toDate() || null)}
                  minDate={reminder ? undefined : dayjs()}
                  slotProps={{
                    textField: {
                      error: Boolean(errors.date),
                      helperText: errors.date?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="time"
              render={({ field }) => (
                <TimePicker
                  label="Time"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(time) => field.onChange(time?.toDate() || null)}
                  slotProps={{
                    textField: {
                      error: Boolean(errors.time),
                      helperText: errors.time?.message,
                    },
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {reminder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
