import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { SERVER_IP } from '../../../../config';
import { warning } from '../../../theme/palette';
import Scrollbar from '../../../components/scrollbar';
import { fDateTime } from '../../../utils/format-time';


// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 1000);

    return () => clearInterval(intervalId);
  },);

  const fetchNotifications = () => {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    fetch(`${SERVER_IP}/api/notifications/get-notifications`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        const notificationsWithModifiedDate = data.map((notification) => {
          const newNotification = { ...notification };
          newNotification.created_at = new Date(newNotification.created_at);
          return newNotification;
        });
        setNotifications(notificationsWithModifiedDate);
      })
      .catch((error) => {
        console.error('Error fetching notifications:', error);
      });
  };

  const handleMarkRead = (notificationId) => {
    fetch(`${SERVER_IP}/api/notifications/mark-as-read/${notificationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchNotifications();
        } else {
          console.error('Error marking notification as read:', data.error);
        }
      })
      .catch((error) => {
        console.error('Error marking notification as read:', error);
      });
  };

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  return (
    <>
      <IconButton color={open ? 'info' : 'default'} onClick={handleOpen}>
        <Badge badgeContent={notifications.filter((notification) => !notification.read).length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {notifications.filter((notification) => !notification.read).length} unread messages
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                New
              </ListSubheader>
            }
          >
            {notifications.slice(0, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={() => handleMarkRead(notification.id)}
              />
            ))}
          </List>
        </Scrollbar>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    created_at: PropTypes.instanceOf(Date),
    id: PropTypes.number,
    devicesName: PropTypes.string,
    lampStatus: PropTypes.string,
    isUnRead: PropTypes.bool,
    message: PropTypes.string,
  }),
  onMarkRead: PropTypes.func,
};

function NotificationItem({ notification, onMarkRead }) {
  const { message } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemText
        primary={message}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            {fDateTime(notification.created_at, 'dd MMM yyyy HH:mm:ss')}
          </Typography>
        }
      />
      <Tooltip title="Mark as Read">
        <IconButton color="primary" onClick={onMarkRead} sx={{ marginLeft: 'auto' }}>
          <DoneOutlinedIcon />
        </IconButton>
      </Tooltip>
    </ListItemButton>
  );
}

function renderContent(notification) {
  const message = (
    <Typography variant="subtitle2">
      <Typography
        component="span"
        variant="subtitle2"
        sx={{ color: warning.main }}
      >
        {notification.message} lamps {notification.devicesName} is in {notification.lampStatus} state.
      </Typography>
    </Typography>

  );
  return {
    message,
  };
}
