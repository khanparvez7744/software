import React from 'react';

import DnsIcon from '@mui/icons-material/Dns';
import WifiIcon from '@mui/icons-material/Wifi';
import DevicesIcon from '@mui/icons-material/Devices';
import Groups3Icon from '@mui/icons-material/Groups3';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';

const icon = (name) => {
  switch (name) {
    case 'application':
      return <SettingsSystemDaydreamIcon />; 
    case 'aocc':
      return <DnsIcon />;
    case 'network':
      return <WifiIcon />; 
    case 'users':
      return <Groups3Icon />;
    case 'stands':
      return <DeviceHubIcon />;
    case 'devices':
      return <DevicesIcon />;
    case 'deviceMap':
      return <CallSplitIcon />;
    default:
      return null;
  }
}; 

const settingsConfig = [
  {
    title: 'Application Settings',
    key: 'ApplicationSettings',
    icon: icon('application'),
  },
  {
    title: 'AOCC',
    key: 'AoccSetup',
    icon: icon('aocc'),
  },
  {
    title: 'Users',
    key: 'Users',
    icon: icon('users'),
  },
  {
    title: 'Stands',
    key: 'Stands',
    icon: icon('stands'),
  },
  {
    title: 'Devices',
    key: 'Devices',
    icon: icon('devices'),
  },
];

export default settingsConfig;
