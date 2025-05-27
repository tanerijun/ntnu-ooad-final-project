'use client';

import * as React from 'react';
import {
  Avatar,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { PencilSimple as EditIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import type { Reminder } from '@/types/reminder';

dayjs.extend(relativeTime);

interface ReminderListProps {
  reminders: Reminder[];
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
  isLoading?: boolean;
}

export function ReminderList({
  reminders,
  onEdit,
  onDelete,
  onToggleComplete,
  isLoading = false,
}: ReminderListProps): React.JSX.Element {
  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
            <Avatar sx={{ bgcolor: 'var(--mui-palette-neutral-100)', color: 'var(--mui-palette-neutral-600)' }}>
              <ClockIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
            <Typography color="text.secondary" variant="body1">
              No reminders yet. Create your first reminder to get started!
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const groupedReminders = reminders.reduce(
    (groups, reminder) => {
      const date = dayjs(reminder.reminderTime).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(reminder);
      return groups;
    },
    {} as Record<string, Reminder[]>
  );

  const sortedDates = Object.keys(groupedReminders).sort();

  return (
    <Stack spacing={3}>
      {sortedDates.map((date) => {
        const dateReminders = groupedReminders[date];
        const isToday = dayjs(date).isSame(dayjs(), 'day');
        const isPast = dayjs(date).isBefore(dayjs(), 'day');

        return (
          <Card key={date}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: isToday ? 'primary.main' : isPast ? 'error.main' : 'text.primary',
                }}
              >
                {isToday ? 'Today' : dayjs(date).format('MMM DD, YYYY')}
                {isPast && !isToday && ' (Overdue)'}
              </Typography>

              <List dense>
                {dateReminders.map((reminder) => {
                  const reminderTime = dayjs(reminder.reminderTime);
                  const isOverdue = reminderTime.isBefore(dayjs()) && !reminder.isCompleted;

                  return (
                    <ListItem
                      key={reminder.id}
                      sx={{
                        opacity: reminder.isCompleted ? 0.6 : 1,
                        bgcolor: isOverdue ? 'error.50' : 'transparent',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Checkbox
                          checked={reminder.isCompleted}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleComplete(reminder.id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isLoading}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: reminder.isCompleted ? 'line-through' : 'none',
                              fontWeight: isOverdue ? 'bold' : 'normal',
                            }}
                          >
                            {reminder.title}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            {reminder.description && (
                              <Typography variant="body2" color="text.secondary">
                                {reminder.description}
                              </Typography>
                            )}
                            <Typography variant="caption" color={isOverdue ? 'error.main' : 'text.secondary'}>
                              {reminderTime.format('h:mm A')} • {reminderTime.fromNow()}
                            </Typography>
                          </Stack>
                        }
                      />

                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => onEdit(reminder)} disabled={isLoading}>
                            <EditIcon fontSize="var(--icon-fontSize-sm)" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => onDelete(reminder.id)}
                            disabled={isLoading}
                            color="error"
                          >
                            <DeleteIcon fontSize="var(--icon-fontSize-sm)" />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
