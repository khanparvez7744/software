import TvIcon from '@mui/icons-material/Tv';
import CableIcon from '@mui/icons-material/Cable';
import NotesIcon from '@mui/icons-material/Notes';
import FlightIcon from '@mui/icons-material/Flight';
import FolderIcon from '@mui/icons-material/Folder';
import Groups3Icon from '@mui/icons-material/Groups3';
import AdUnitsIcon from '@mui/icons-material/AdUnits';
import ArticleIcon from '@mui/icons-material/Article';
import SettingsIcon from '@mui/icons-material/Settings';
import VideocamIcon from '@mui/icons-material/Videocam';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CampaignIcon from '@mui/icons-material/Campaign';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// ----------------------------------------------------------------------

const icon = (name) => {
  switch (name) {
    case 'home':
      return <DashboardIcon />;
    case 'user':
      return <Groups3Icon />;
    case 'userRoles':
      return <AdminPanelSettingsIcon />;
    case 'devices':
      return <DevicesOtherIcon />;
    case 'circuits':
      return <CableIcon />;
    case 'reports':
      return <SummarizeIcon />;
    case 'settings':
      return <SettingsIcon />;
    case 'right-arrow':
      return <KeyboardArrowRightIcon />;
    case 'logs':
      return <NotesIcon />;
    case 'flights':
      return <FlightIcon />;
    case 'notifications':
      return <NotificationsIcon />;
    case 'camera':
      return <VideocamIcon />;
    case 'rids':
      return <AdUnitsIcon />;
    case 'scheduleFlight':
      return <ScheduleIcon />;
    case 'updateFlight':
      return <EditCalendarIcon />;
    case 'flightData':
      return <TvIcon />;
    case 'billingReport':
      return <AirplaneTicketIcon />;
    case 'standStatus':
      return <CampaignIcon />;
    case 'dockEvent':
      return <FlightLandIcon />;
    case 'sensorReport':
      return <ThermostatIcon />;
    case 'storage':
      return <FolderIcon />;
    case 'serverLogs':
      return <ArticleIcon />;
    case 'block':
      return <FlightLandIcon />;
    case 'systemMonitor':
      return <MonitorHeartIcon />;
    default:
      return null;
  }
};

const navConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('home'),
    role: 0
  },
  {
    title: 'Flights',
    icon: icon('flights'),
    role: 0,
    children: [
      {
        title: 'Flights',
        icon: icon('flightData'),
        role: 0,
      },
      {
        title: 'Schedule Flight',
        icon: icon('scheduleFlight'),
        role: 0,
      },
      {
        title: 'Update Flight',
        icon: icon('updateFlight'),
        role: 0,
      },
    ],
  },
  {
    title: 'Reports',
    icon: icon('reports'),
    role: 0,
    children: [
      {
        title: 'Billing Report',
        icon: icon('billingReport'),
        role: 0,
      },
      {
        title: 'Stand Status',
        icon: icon('standStatus'),
        role: 0,
      },
      {
        title: 'Docking Event',
        icon: icon('dockEvent'),
        role: 0,
      },
      {
        title: 'Sensor Report',
        icon: icon('sensorReport'),
        role: 0,
      },
    ],
  },
  {
    title: 'Notifications',
    icon: icon('notifications'),
    role: 0,
  },
  {
    title: 'Camera',
    path: '/camera',
    icon: icon('camera'),
    role: 0,
  },
  {
    title: 'RIDS',
    path: '/rids',
    icon: icon('rids'),
    role: 0,
  },
  {
    title: 'Storage',
    icon: icon('storage'),
    role: 0,
  },
  {
    title: 'Settings',
    icon: icon('settings'),
    role: 1,
  },
  {
    title: 'System Monitor',
    icon: icon('systemMonitor'),
    role: 1,
  },
  {
    title: 'Logs',
    icon: icon('serverLogs'),
    role: 1,
  },
  {
    title: 'Blocking',
    icon: icon('block'),
    role: 1,
  },
];

export default navConfig;
