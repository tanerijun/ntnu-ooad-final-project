'use client';

import * as React from 'react';
import { Alert, Box, Card, CardContent, CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import dayjs, { type Dayjs } from 'dayjs';

import type { Reminder } from '@/types/reminder';
import { logger } from '@/lib/default-logger';
import { reminderClient } from '@/lib/reminder/client';
import { ReminderForm } from '@/components/dashboard/reminders/reminder-form';
import { ReminderList } from '@/components/dashboard/reminders/reminder-list';

export default function Page(): React.JSX.Element {
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Dayjs>(dayjs());
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingReminder, setEditingReminder] = React.useState<Reminder | undefined>();
  const [error, setError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchReminders = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await reminderClient.getReminders();
      setReminders(data);
      setError('');
    } catch (err) {
      setError('Failed to load reminders');
      logger.error('Error fetching reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchReminders();
  }, [fetchReminders]);

  const selectedDateReminders = React.useMemo(() => {
    return reminders.filter((reminder) => dayjs(reminder.reminderTime).isSame(selectedDate, 'day'));
  }, [reminders, selectedDate]);

  const upcomingReminders = React.useMemo(() => {
    return reminders
      .filter((reminder) => !reminder.isCompleted)
      .sort((a, b) => dayjs(a.reminderTime).diff(dayjs(b.reminderTime)))
      .slice(0, 5);
  }, [reminders]);

  const handleCreateReminder = async (data: { title: string; description?: string; reminderTime: string }) => {
    try {
      setIsSubmitting(true);
      await reminderClient.createReminder(data);
      await fetchReminders();
      setError('');
    } catch (err) {
      setError('Failed to create reminder');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReminder = async (data: { title: string; description?: string; reminderTime: string }) => {
    if (!editingReminder) return;

    try {
      setIsSubmitting(true);
      await reminderClient.updateReminder(editingReminder.id, data);
      await fetchReminders();
      setError('');
    } catch (err) {
      setError('Failed to update reminder');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReminder = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await reminderClient.deleteReminder(id);
      await fetchReminders();
      setError('');
    } catch (err) {
      setError('Failed to delete reminder');
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    // Optimistic update
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === id ? { ...reminder, isCompleted: completed } : reminder))
    );

    try {
      await reminderClient.updateReminder(id, { isCompleted: completed });
      setError('');
    } catch (err) {
      // Revert optimistic update on error
      setReminders((prev) =>
        prev.map((reminder) => (reminder.id === id ? { ...reminder, isCompleted: !completed } : reminder))
      );
      setError('Failed to update reminder');
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReminder(undefined);
  };

  const handleDateSelect = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4">Reminders</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Manage your tasks and get notified when it&apos;s time
          </Typography>
        </Box>

        {error ? (
          <Alert
            severity="error"
            onClose={() => {
              setError('');
            }}
          >
            {error}
          </Alert>
        ) : null}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Calendar
              </Typography>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateSelect}
                sx={{
                  width: '100%',
                  '& .MuiPickersDay-root': {
                    position: 'relative',
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Upcoming Reminders
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : upcomingReminders.length > 0 ? (
                <Stack spacing={2}>
                  {upcomingReminders.map((reminder) => (
                    <Card key={reminder.id} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" noWrap>
                          {reminder.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(reminder.reminderTime).format('MMM DD, h:mm A')}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No upcoming reminders
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedDate.isSame(dayjs(), 'day')
              ? "Today's Reminders"
              : `Reminders for ${selectedDate.format('MMM DD, YYYY')}`}
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ReminderList
              reminders={selectedDateReminders}
              onEdit={handleEditReminder}
              onDelete={handleDeleteReminder}
              onToggleComplete={handleToggleComplete}
              isLoading={isSubmitting}
            />
          )}
        </Box>

        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => {
            setIsFormOpen(true);
          }}
        >
          <PlusIcon fontSize="var(--icon-fontSize-lg)" />
        </Fab>

        <ReminderForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingReminder ? handleUpdateReminder : handleCreateReminder}
          reminder={editingReminder}
          isLoading={isSubmitting}
        />
      </Stack>
    </LocalizationProvider>
  );
}
