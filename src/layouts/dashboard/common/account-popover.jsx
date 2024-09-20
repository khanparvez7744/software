import { useState, useEffect } from 'react';
import {NavLink, useNavigate} from 'react-router-dom';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { SERVER_IP } from '../../../../config';
import { useAuth } from '../../../auth-context/auth-context';

export default function AccountPopover() {
  const [userData, setUserData] = useState({});
  const [open, setOpen] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`${SERVER_IP}/api/users/get-sidebar-user-details/${user.user_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (Object.keys(data).length > 0) {
            setUserData(data);
          } else {
            console.error('Empty response or invalid JSON format');
          }
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, [user]);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleLogout = () => {
    fetch(`${SERVER_IP}/api/users/logout`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId: user.user_id,
      }),
    })
      .then(response => response.json())
      .then(data => {

      })
      .catch(error => {

      });
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          // src={user.role === 2 ? `./assets/images/profiles/atc.jpg` : './assets/images/avatars/avatar_13.jpg'}
          src='./assets/images/avatars/avatar_13.jpg'
          alt={userData?.name}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        />
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            ml: 0.75,
            width: 200,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {userData.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {userData.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          component={NavLink}
          to="/account-details"
          onClick={handleClose}
          sx={{ typography: 'body2', py: 1.5 }}
        >
          Account Details
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed'}} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleLogout}
          sx={{ typography: 'subtitle1', color: 'error.mainOrange', py: 1.5 }}
        >
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}
