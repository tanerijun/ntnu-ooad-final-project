'use client';

import * as React from 'react';
import { Box, Button, Chip, Divider, List, ListItem, ListItemText, Popover, Stack, Typography } from '@mui/material';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import type { Reminder } from '@/types/reminder';

dayjs.extend(relativeTime);

export interface NotificationPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  reminders: Reminder[];
}

export function NotificationPopover({
  anchorEl,
  onClose,
  open,
  reminders,
}: NotificationPopoverProps): React.JSX.Element {
  const handleViewReminders = () => {
    window.location.href = '/dashboard/reminders';
    onClose();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      sx={{ mt: 1 }}
    >
      <Box sx={{ p: 2, minWidth: 320, maxWidth: 400 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Notifications</Typography>
          {reminders.length > 0 && <Chip label={reminders.length} color="error" size="small" />}
        </Stack>

        {reminders.length === 0 ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 3 }}>
            <ClockIcon size={32} color="var(--mui-palette-text-secondary)" />
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No pending reminders
            </Typography>
          </Stack>
        ) : (
          <>
            <List dense sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {reminders.map((reminder, index) => (
                <React.Fragment key={reminder.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" noWrap>
                          {reminder.title}
                        </Typography>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          {reminder.description ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {reminder.description}
                            </Typography>
                          ) : null}
                          <Typography variant="caption" color="error.main">
                            {dayjs(reminder.reminderTime).format('MMM DD, h:mm A')} •{' '}
                            {dayjs(reminder.reminderTime).fromNow()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < reminders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />

            <Button variant="outlined" fullWidth onClick={handleViewReminders} size="small">
              View All Reminders
            </Button>
          </>
        )}
      </Box>
    </Popover>
  );
}
