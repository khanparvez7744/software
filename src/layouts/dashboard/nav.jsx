import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { NAV } from './config-layout';
import Logo from '../../components/logo';
import { SERVER_IP } from '../../../config';
import navConfig from './config-navigation';
import { usePathname } from '../../routes/hooks';
import Scrollbar from '../../components/scrollbar';
import { RouterLink } from '../../routes/components';
import { useAuth } from '../../auth-context/auth-context';
import { useResponsive } from '../../hooks/use-responsive';

// ----------------------------------------------------------------------

export default function Nav({
  openNav,
  onCloseNav,
  openScheduleFlightForm,
  openUpdateFlightForm,
  openBillingReport,
  openStandStatusReport,
  openDockingEventLog,
  openSensorReport,
  openFlights,
  openNotifications,
  openSystemSettings,
  openStorage,
  openServerLogs,
  openBlocking,
  openSystemMonitor,
}) {
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  const handlePopoverOpen = (event, title) => {
    setAnchorEl(event.currentTarget);
    setOpenDropdown(title);
  };

  const handlePopoverClose = () => {
    setOpenDropdown(null);
  };

  const handleLogout = () => {
    fetch(`${SERVER_IP}/api/users/logout`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId: user.userId,
      }),
    }).then((response) => response.json());
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = (<Box
    sx={{
      display: 'flex', borderRadius: 1.5, justifyContent: 'center', margin: 3,
    }}
  >
    <Avatar alt="accountDetails" src="./assets/images/avatars/avatar_13.jpg" />
  </Box>);

  const handleSubMenuClick = (item) => {
    if (item.title === 'Schedule Flight') {
      openScheduleFlightForm();
    }
    if (item.title === 'Update Flight') {
      openUpdateFlightForm();
    }
    if (item.title === 'Billing Report') {
      openBillingReport();
    }
    if (item.title === 'Stand Status') {
      openStandStatusReport();
    }
    if (item.title === 'Docking Event') {
      openDockingEventLog();
    }
    if (item.title === 'Sensor Report') {
      openSensorReport();
    }
    if (item.title === 'Flights') {
      openFlights();
    }
    if (item.title === 'Notifications') {
      openNotifications();
    }
    if (item.title === 'Settings') {
      openSystemSettings();
    }
    if (item.title === 'Storage') {
      openStorage();
    }
    if (item.title === 'Logs') {
      openServerLogs();
    }
    if (item.title === 'Blocking') {
      openBlocking();
    }
    if (item.title === 'System Monitor') {
      openSystemMonitor();
    }
    setOpenDropdown(null);
  };

  const renderSubMenu = (subMenuItems) => subMenuItems
    .filter((subItem) => subItem.role === 0 || (subItem.role === 1 && user.role === 1))
    .map((subItem) => (<MenuItem
      key={subItem.title}
      onClick={() => {
        handleSubMenuClick(subItem);
      }}
      sx={{
        borderRadius: '8px', margin: 0.8, padding: 1,
      }}
    >
      <Box component="span" sx={{ width: 20, height: 20, mr: 2 }}>
        {subItem.icon}
      </Box>
      {subItem.title}
    </MenuItem>));

  const renderMenu = (<Stack component="nav" sx={{ paddingLeft: '4px', paddingRight: '4px' }}>
    <Box component="ul" sx={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {navConfig
        .filter((item) => item.role === 0 || (item.role === 1 && user.role === 1))
        .map((item) => item.children ? (<Box
          key={item.title}
          component="li"
          sx={{ listStyle: 'none' }}
          onMouseEnter={(event) => handlePopoverOpen(event, item.title)}
          onMouseLeave={handlePopoverClose}
        >
          <Button
            sx={{
              borderRadius: '8px',
              typography: 'body2',
              color: 'grey.500',
              textTransform: 'capitalize',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <Box component="span" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 1 }}>
              <Box component="span" sx={{ width: 22, height: 22, ml: 2 }}>
                {item.icon}
              </Box>
              <KeyboardArrowRightIcon sx={{ ml: 0.5, alignSelf: 'center', width: 18, height: 18 }} />
            </Box>
            <Box component="span" sx={{ fontSize: '13px', textAlign: 'center' }}>{item.title}</Box>
          </Button>
          <Popover
            anchorEl={anchorEl}
            open={openDropdown === item.title}
            anchorOrigin={{
              vertical: 'center', horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'center', horizontal: 'left',
            }}
            sx={{
              pointerEvents: 'none',
            }}
            PaperProps={{
              sx: {
                background: 'transparent', // background: 'linear-gradient(90deg, rgba(65,65,65,0.34217436974789917) 0%, rgba(33,43,54,0.32816876750700286) 20%, rgba(33,43,54,0.25253851540616246) 50%, rgba(33,43,54,0.2189250700280112) 80%, rgba(112,39,39,0.258140756302521) 100%)',
                backdropFilter: 'blur(80px)',
              },
            }}
            disableRestoreFocus
          >
            <Paper
              sx={{
                pointerEvents: 'auto', background: 'none',
              }}
              onMouseLeave={handlePopoverClose}
            >
              {renderSubMenu(item.children)}
            </Paper>
          </Popover>
        </Box>) : (<NavItem
          key={item.title}
          item={item}
          userRole={user.role}
          openScheduleFlightForm={openScheduleFlightForm}
          openUpdateFlightForm={openUpdateFlightForm}
          openBillingReport={openBillingReport}
          openStandStatusReport={openStandStatusReport}
          openDockingEventLog={openDockingEventLog}
          openSensorReport={openSensorReport}
          openFlights={openFlights}
          openNotifications={openNotifications}
          openSystemSettings={openSystemSettings}
          openStorage={openStorage}
          openServerLogs={openServerLogs}
          openBlocking={openBlocking}
          openSystemMonitor={openSystemMonitor}
        />))}
    </Box>
  </Stack>);

  const renderContent = (<Scrollbar
    sx={{
      height: 1, '& .simplebar-content': {
        height: 1, display: 'flex', flexDirection: 'column',
      },
    }}
  >
    <Box
      sx={{
        display: 'flex', borderRadius: 1.5, justifyContent: 'center',
      }}
    >
      <Logo sx={{ mt: 3 }} />
    </Box>

    {renderAccount}

    {renderMenu}


    <Box sx={{ flexGrow: 1 }} />
    <Box
      sx={{
        display: 'flex', borderRadius: 1.5, justifyContent: 'center', my: 3.5,
      }}
    >
      <Button
        variant="contained"
        color="inherit"
        sx={{ width: '50%' }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  </Scrollbar>);

  return (<Box
    sx={{
      flexShrink: { lg: 0 }, width: { lg: NAV.WIDTH },
    }}
  >
    {upLg ? (<Box
      sx={{
        height: 1, position: 'fixed', width: NAV.WIDTH, borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {renderContent}
    </Box>) : (<Drawer
      open={openNav}
      onClose={onCloseNav}
      PaperProps={{
        sx: {
          width: NAV.WIDTH,
        },
      }}
    >
      {renderContent}
    </Drawer>)}
  </Box>);
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
  openScheduleFlightForm: PropTypes.func,
  openUpdateFlightForm: PropTypes.func,
  openBillingReport: PropTypes.func,
  openStandStatusReport: PropTypes.func,
  openDockingEventLog: PropTypes.func,
  openSensorReport: PropTypes.func,
  openFlights: PropTypes.func,
  openNotifications: PropTypes.func,
  openSystemSettings: PropTypes.func,
  openStorage: PropTypes.func,
  openServerLogs: PropTypes.func,
  openBlocking: PropTypes.func,
  openSystemMonitor: PropTypes.func,
};

function NavItem({
  item,
  userRole,
  openScheduleFlightForm,
  openUpdateFlightForm,
  openBillingReport,
  openStandStatusReport,
  openDockingEventLog,
  openSensorReport,
  openFlights,
  openNotifications,
  openSystemSettings,
  openStorage,
  openServerLogs,
  openBlocking,
  openSystemMonitor,
}) {
  const pathname = usePathname();
  const active = pathname.startsWith(item.path);

  const handleClick = () => {
    if (item.title === 'Schedule Flight') {
      openScheduleFlightForm();
    }
    if (item.title === 'Update Flight') {
      openUpdateFlightForm();
    }
    if (item.title === 'Billing Report') {
      openBillingReport();
    }
    if (item.title === 'Stand Status') {
      openStandStatusReport();
    }
    if (item.title === 'Docking Event') {
      openDockingEventLog();
    }
    if (item.title === 'Sensor Report') {
      openSensorReport();
    }
    if (item.title === 'Flights') {
      openFlights();
    }
    if (item.title === 'Notifications') {
      openNotifications();
    }
    if (item.title === 'Settings') {
      openSystemSettings();
    }
    if (item.title === 'Storage') {
      openStorage();
    }
    if (item.title === 'Logs') {
      openServerLogs();
    }
    if (item.title === 'Blocking') {
      openBlocking();
    }
    if (item.title === 'System Monitor') {
      openSystemMonitor();
    }
  };

  if (item.role === 1 && userRole !== 1) {
    return null;
  }

  return (<Box
    key={item.title}
    component="li"
    sx={{ listStyle: 'none' }}
  >
    <Button
      component={item.path ? RouterLink : 'button'}
      href={item.path}
      sx={{
        width: '100%',
        borderRadius: '8px',
        typography: 'body2',
        color: 'grey.500',
        textTransform: 'capitalize',
        flexDirection: 'column',
        alignItems: 'center',
        '&:hover': {
          color: 'text.primary',
        },
        fontWeight: 'fontWeightMedium', ...(active && {
          color: 'error.mainOrange',
          fontWeight: 'fontWeightSemiBold',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
          },
        }),
      }}
      onClick={handleClick}
    >
      <Box component="span" sx={{ width: 22, height: 22, mb: 1 }}>
        {item.icon}
      </Box>
      <Box component="span" sx={{ fontSize: '13px', textAlign: 'center' }}>
        {item.title}
      </Box>
    </Button>
  </Box>);
}

NavItem.propTypes = {
  item: PropTypes.object,
  userRole: PropTypes.number.isRequired,
  openScheduleFlightForm: PropTypes.func,
  openBillingReport: PropTypes.func,
  openStandStatusReport: PropTypes.func,
  openDockingEventLog: PropTypes.func,
  openSensorReport: PropTypes.func,
  openFlights: PropTypes.func,
  openNotifications: PropTypes.func,
  openSystemSettings: PropTypes.func,
  openStorage: PropTypes.func,
  openServerLogs: PropTypes.func,
  openBlocking: PropTypes.func,
  openSystemMonitor: PropTypes.func,
  openUpdateFlightForm: PropTypes.func,
};