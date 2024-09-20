import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import ListIcon from '@mui/icons-material/List';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import ListItemButton from '@mui/material/ListItemButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import Users from '../users';
import Stands from '../stands';
import Devices from '../devices';
import AOCCConfig from '../aocc-config';
import Label from '../../../components/label';
import settingsConfig from './settingsConfig';
import Scrollbar from '../../../components/scrollbar';
import ApplicationSettings from '../application-settings';
import { useResponsive } from '../../../hooks/use-responsive';
import { SETTINGS } from '../../../layouts/dashboard/config-layout';

// ----------------------------------------------------------------------

export default function SystemSettingsPage({ open, onClose }) {
  const [modalHeight, setModalHeight] = useState(400);

  const theme = useTheme();

  const lgUp = useResponsive('up', 'lg');

  const [openSettingNav, setOpenSettingNav] = useState(false);

  const [selectedOption, setSelectedOption] = useState('ApplicationSettings');

  useEffect(() => {
    if (selectedOption === 'ApplicationSettings' || selectedOption === 'AoccSetup' || selectedOption === 'Users') {
      setModalHeight(400);
    }
    else {
      setModalHeight(600);
    }
  }, [selectedOption]);

  const renderSettingsItems = () => (settingsConfig.map((item) => (<ListItemButton
    key={item.key}
    onClick={() => setSelectedOption(item.key)}
    sx={{
      minHeight: 44,
      borderRadius: 0.75,
      typography: 'body2',
      color: 'text.secondary',
      textTransform: 'capitalize',
      fontWeight: 'fontWeightMedium',
      marginBottom: '5px', ...(selectedOption === item.key && {
        color: 'warning.main',
        fontWeight: 'fontWeightSemiBold',
        bgcolor: alpha(theme.palette.warning.main, 0.08),
        '&:hover': {
          bgcolor: alpha(theme.palette.warning.main, 0.16),
        },
      }),
    }}
  >
    <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
      {item.icon}
    </Box>
    <Box component="span">{item.title}</Box>
  </ListItemButton>)));

  const renderContent = (<Scrollbar
    sx={{
      height: 1, '& .simplebar-content': {
        height: 1, display: 'flex', flexDirection: 'column',
      },
    }}
  >
    <Label variant="soft" color="default" sx={{ fontSize: '1.1rem', height: '40px' }} mr={2}>
      System Settings
    </Label>
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }} mr={2} mt={2}>
      <Box>
        {renderSettingsItems()}
      </Box>
    </Stack>
    <Box sx={{ flexGrow: 1 }} />
  </Scrollbar>);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {!lgUp && (<DialogTitle sx={{ m: 0, p: 2 }}>
          <Toolbar
            sx={{
              height: 1, px: { lg: 5 },
            }}
          >
            <IconButton
              onClick={() => setOpenSettingNav(!openSettingNav)}
              sx={{ mr: 1 }}
            >
              <ListIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
          </Toolbar>
        </DialogTitle>
        )
        }
        <DialogContent>
          <Box
            sx={{
              display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, height: `${modalHeight}px`
            }}
          >
            <Box
              sx={{
                flexShrink: { lg: 0 }, width: { lg: SETTINGS.WIDTH },
              }}
            >
              {lgUp ? (<Box
                sx={{
                  width: SETTINGS.WIDTH, borderRight: `dashed 1px ${theme.palette.divider}`, height: 1,
                }}
              >
                {renderContent}
              </Box>) : (
                <Drawer
                  open={openSettingNav}
                  onClose={() => setOpenSettingNav(false)}
                  PaperProps={{
                    sx: {
                      width: SETTINGS.WIDTH,
                    },
                  }}
                >
                  {renderContent}
                </Drawer>
              )}
            </Box>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                px: 2,
                py: `50px`,
                width: `100%`,
                overflowY: 'auto',
              }}
            >
              {selectedOption === 'ApplicationSettings' &&
                <ApplicationSettings />
              }

              {selectedOption === 'AoccSetup' &&
                <AOCCConfig />
              }
              {selectedOption === 'Users' &&
                <Users />
              }
              {selectedOption === 'Stands' &&
                <Stands />
              }
              {selectedOption === 'Devices' &&
                <Devices />
              }
            </Box>
          </Box>
        </DialogContent>
      </LocalizationProvider>
    </Dialog>);
}

SystemSettingsPage.propTypes = {
  open: PropTypes.bool, onClose: PropTypes.func,
};