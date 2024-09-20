import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ListIcon from '@mui/icons-material/List';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { SERVER_IP } from '../../../config';
import { NAV, HEADER } from './config-layout';
import { useResponsive } from '../../hooks/use-responsive';

// ----------------------------------------------------------------------

export default function Main({ onOpenNav, children, sx, ...other }) {
  const theme = useTheme();

  const lgUp = useResponsive('up', 'lg');

  const SPACING = 8; 

  const [airportName, setAirportName] = useState('');

  const [dateTime, setDateTime] = useState({
    date: '',
    time: '',
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { day: '2-digit', month: 'short', year: '2-digit' };
      const formattedDate = now.toLocaleDateString('en-GB', options);
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setDateTime({
        date: formattedDate,
        time: formattedTime,
      });
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetch(`${SERVER_IP}/api/config/get-application-settings`)
      .then(response => response.json())
      .then(data => {
        setAirportName(() => data.airport_name);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        // py: `${HEADER.H_MOBILE + SPACING}px`,
        paddingTop: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          // px: 2,
          paddingTop: `${HEADER.H_DESKTOP}px`,
          // paddingBottom: `${HEADER.H_DESKTOP - BottomSPACING}px`,
          width: `calc(100% - ${NAV.WIDTH}px)`,
        }),
        ...sx,
      }}
      {...other}
    >
      <AppBar
        sx={{
          boxShadow: 'none',
          height: HEADER.H_MOBILE,
          zIndex: theme.zIndex.appBar + 1,
          backdropFilter: 'blur(200px)',
          background: 'linear-gradient(90deg, rgba(22,28,36,0.3029586834733894) 75%, rgba(255,0,0,0.2497373949579832) 100%)',
          borderBottom: 'dashed 1px #919eab40',
          transition: theme.transitions.create(['height'], {
            duration: theme.transitions.duration.shorter,
          }),
          ...(lgUp && {
            width: `calc(100% - ${NAV.WIDTH + 1}px)`,
            height: HEADER.H_DESKTOP,
          }),
        }}
      >
        <Toolbar
          sx={{
            height: 1,
            px: { lg: 5 },
            backgroundColor: 'transparent',
            justifyContent: 'space-between',
          }}
        >
          {!lgUp && (
            <IconButton onClick={onOpenNav} sx={{ mr: 1 }}>
              <ListIcon />
            </IconButton>
          )}
          <Stack direction="column" alignItems="left" spacing={1}>
            <Typography variant="h5">
              SmartDockAI - GOS
            </Typography>
            <Typography variant="h6">
              {airportName}
            </Typography>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="column" alignItems="end" spacing={1}>
            <Typography variant="body1">Date: {dateTime.date}</Typography>
            <Typography variant="body1">Time: {dateTime.time}</Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
  onOpenNav: PropTypes.func,
};
