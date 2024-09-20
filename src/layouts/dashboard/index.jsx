import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import Nav from './nav';
import Main from './main';
import { socket } from '../../websocket/websocket';
import { StorageView } from '../../sections/storage';
import { FlightsView } from '../../sections/flights/view';
import { SystemMonitor } from '../../sections/system-monitor';
import { BlockingView } from '../../sections/blocking/view';
import { UpdateFlightView } from '../../sections/update-flight';
import { ServerLogsView } from '../../sections/server-logs/view';
import { ScheduleFlightView } from '../../sections/schedule-flight';
import { SensorReportView } from '../../sections/sensor-report/view';
import { NotificationsView } from '../../sections/notifications/view';
import { BillingReportView } from '../../sections/billing-report/view';
import { SystemSettingsView } from '../../sections/system-settings/view';
import { DockingEventLogView } from '../../sections/docking-event-log/view';
import { StandStatusReportView } from '../../sections/stand-status-report/view';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const [openNav, setOpenNav] = useState(false);
  const [isScheduleFlightOpen, setIsScheduleFlightOpen] = useState(false);
  const [isUpdateFlightOpen, setIsUpdateFlightOpen] = useState(false);
  const [isBillingReportOpen, setIsBillingReportOpen] = useState(false);
  const [isStandStatusReportOpen, setIsStandStatusReportOpen] = useState(false);
  const [isDockingEventLogOpen, setIsDockingEventLogOpen] = useState(false);
  const [isSensorReportOpen, setIsSensorReportOpen] = useState(false);
  const [isFlightsOpen, setIsFlightsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isServerLogsOpen, setIsServerLogsOpen] = useState(false);
  const [isBlockingOpen, setIsBlockingOpen] = useState(false);
  const [isSystemMonitorOpen, setIsSystemMonitorOpen] = useState(false);

  const openScheduleFlightForm = () => {
    setIsScheduleFlightOpen(true);
  };

  const closeScheduleFlightForm = () => {
    setIsScheduleFlightOpen(false);
  };

  const openUpdateFlightForm = () => {
    setIsUpdateFlightOpen(true);
  };

  const closeUpdateFlightForm = () => {
    setIsUpdateFlightOpen(false);
  };

  const openBillingReport = () => {
    setIsBillingReportOpen(true);
  };

  const closeBillingReport = () => {
    setIsBillingReportOpen(false);
  };

  const openStandStatusReport = () => {
    setIsStandStatusReportOpen(true);
  };

  const closeStandStatusReport = () => {
    setIsStandStatusReportOpen(false);
  };

  const openDockingEventLog = () => {
    setIsDockingEventLogOpen(true);
  };

  const closeDockingEventLog = () => {
    setIsDockingEventLogOpen(false);
  };

  const openSensorReport = () => {
    setIsSensorReportOpen(true);
  };

  const closeSensorReport = () => {
    setIsSensorReportOpen(false);
  };

  const openFlights = () => {
    setIsFlightsOpen(true);
  };

  const closeFlights = () => {
    setIsFlightsOpen(false);
  };

  const openNotifications = () => {
    setIsNotificationsOpen(true);
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const openSystemSettings = () => {
    setIsSystemSettingsOpen(true);
  };

  const closeSystemSettings = () => {
    setIsSystemSettingsOpen(false);
  };

  const openStorage = () => {
    setIsStorageOpen(true);
  };

  const closeStorage = () => {
    setIsStorageOpen(false);
  };

  const openServerLogs = () => {
    setIsServerLogsOpen(true);
  };

  const closeServerLogs = () => {
    setIsServerLogsOpen(false);
  };

  const openBlocking = () => {
    setIsBlockingOpen(true);
  };

  const closeBlocking = () => {
    setIsBlockingOpen(false);
  };

  const openSystemMonitor = () => {
    setIsSystemMonitorOpen(true);
  };

  const closeSystemMonitor = () => {
    setIsSystemMonitorOpen(false);
  };

  const handleNotification = (data) => {
    switch (data.type) {
      case 'success':
        toast.success(data.notification);
        break;
      case 'error':
        toast.error(data.notification);
        break;
      case 'info':
        toast.info(data.notification);
        break;
      case 'warning':
        toast.warning(data.notification);
        break;
      default:
        toast(data.notification);
    }
  };

  useEffect(() => {
    socket.on('Notification:', handleNotification);

    // Cleanup the event listener on component unmount
    return () => {
      socket.off('Notification:', handleNotification);
    };
  }, []);

  return (<Box
    sx={{
      minHeight: 1, display: 'flex', flexDirection: { xs: 'column', lg: 'row' },
    }}
  >
    <Nav openNav={openNav} onCloseNav={() => setOpenNav(false)} openScheduleFlightForm={openScheduleFlightForm}
      openUpdateFlightForm={openUpdateFlightForm} openBillingReport={openBillingReport}
      openStandStatusReport={openStandStatusReport} openDockingEventLog={openDockingEventLog}
      openSensorReport={openSensorReport}
      openFlights={openFlights} openNotifications={openNotifications} openSystemSettings={openSystemSettings}
      openStorage={openStorage} openServerLogs={openServerLogs} openBlocking={openBlocking} openSystemMonitor={openSystemMonitor} />
    <Main onOpenNav={() => setOpenNav(true)}>{children}</Main>
    <ScheduleFlightView open={isScheduleFlightOpen} onClose={closeScheduleFlightForm} />
    <UpdateFlightView open={isUpdateFlightOpen} onClose={closeUpdateFlightForm} />
    <BillingReportView open={isBillingReportOpen} onClose={closeBillingReport} />
    <StandStatusReportView open={isStandStatusReportOpen} onClose={closeStandStatusReport} />
    <DockingEventLogView open={isDockingEventLogOpen} onClose={closeDockingEventLog} />
    <SensorReportView open={isSensorReportOpen} onClose={closeSensorReport} />
    <FlightsView open={isFlightsOpen} onClose={closeFlights} />
    <NotificationsView open={isNotificationsOpen} onClose={closeNotifications} />
    <StorageView open={isStorageOpen} onClose={closeStorage} />
    <SystemSettingsView open={isSystemSettingsOpen} onClose={closeSystemSettings} />
    <ServerLogsView open={isServerLogsOpen} onClose={closeServerLogs} />
    <BlockingView open={isBlockingOpen} onClose={closeBlocking} />
    <SystemMonitor open={isSystemMonitorOpen} onClose={closeSystemMonitor} />
  </Box>);
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
