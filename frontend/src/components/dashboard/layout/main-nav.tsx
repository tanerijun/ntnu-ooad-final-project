'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import type { Reminder } from '@/types/reminder';
import { logger } from '@/lib/default-logger';
import { reminderClient } from '@/lib/reminder-client';
import { usePopover } from '@/hooks/use-popover';
import { useSearch } from '@/hooks/use-search';
import { useUser } from '@/hooks/use-user';

import { SearchModal } from '../search/search-modal';
import { MobileNav } from './mobile-nav';
import { NotificationPopover } from './notification-popover';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element | null {
  const { user } = useUser();

  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [pendingReminders, setPendingReminders] = React.useState<Reminder[]>([]);
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useSearch();

  const userPopover = usePopover<HTMLDivElement>();
  const notificationPopover = usePopover<HTMLButtonElement>();

  // Check for pending reminders every minute
  React.useEffect(() => {
    if (!user) return;

    const checkPendingReminders = async () => {
      try {
        const pending = await reminderClient.getPendingReminders();
        setPendingReminders(pending);
      } catch (error) {
        logger.error('Failed to fetch pending reminders:', error);
      }
    };

    void checkPendingReminders();

    const interval = setInterval(checkPendingReminders, 60000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            <Tooltip title="Search (⌘K)">
              <IconButton onClick={openSearch}>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notifications">
              <Badge
                badgeContent={pendingReminders.length}
                color="error"
                variant={pendingReminders.length > 0 ? 'standard' : 'dot'}
              >
                <IconButton onClick={notificationPopover.handleOpen} ref={notificationPopover.anchorRef}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={user.avatarUrl}
              sx={{ cursor: 'pointer' }}
            >
              {user.name.charAt(0) || ''}
            </Avatar>
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <NotificationPopover
        anchorEl={notificationPopover.anchorRef.current}
        onClose={notificationPopover.handleClose}
        open={notificationPopover.open}
        reminders={pendingReminders}
      />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
      <SearchModal open={isSearchOpen} onClose={closeSearch} />
    </React.Fragment>
  );
}
