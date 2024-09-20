import axios from 'axios';
import 'dayjs/locale/en-gb';
import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect } from 'react';
import { Pie, Cell, Legend, Tooltip, PieChart } from 'recharts';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import CircularProgress from '@mui/material/CircularProgress';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import Label from '../../components/label';
import { SERVER_IP } from '../../../config';

export default function SystemMonitor({ open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalIdRef = useRef(null);
  const initialFetchRef = useRef(false);

  const fetchData = async () => {
    try {
      if (!initialFetchRef.current) {
        setLoading(true);
      }
      const response = await axios.get(`${SERVER_IP}/api/system/get-monitor-details`);
      setData(response.data);
      initialFetchRef.current = true;
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
      intervalIdRef.current = setInterval(fetchData, 5000);
    } else {
      setData(null);
      setLoading(false);
      initialFetchRef.current = false;
      clearInterval(intervalIdRef.current);
    }

    return () => {
      clearInterval(intervalIdRef.current);
    };
  }, [open]);

  const cpuUsage = open && data ? parseFloat(data.cpuUsage) : 0;
  const memUsed = open && data ? 100 - parseFloat(data.freeMem) : 0;
  const memFree = open && data ? parseFloat(data.freeMem) : 0;
  const raidHealthData = open && data && Array.isArray(data.raidHealth) && data.raidHealth.length > 0 ? data.raidHealth.map((raid, index) => ({
    name: `RAID ${index + 1}`,
    activeDevices: raid.activeDevices || 0,
    failedDevices: raid.failedDevices || 0,
    workingDevices: raid.workingDevices || 0,
    filledPercentage: (raid.activeDevices / (raid.activeDevices + raid.failedDevices || 1)) * 100,
    raidLevel: raid.raidLevel || 'Unknown',
    state: raid.state || 'Unknown',
    arraySize: raid.arraySize || 'Unknown',
    usedDevSize: raid.usedDevSize || 'Unknown',
    resyncStatus: raid.resyncStatus || 'Not applicable',
    disks: raid.disks || [],
  })) : [];

  return (<Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
        System Monitor
      </DialogTitle>
      <DialogContent>
        {loading ? (<Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ height: '200px' }}
        >
          <CircularProgress variant="indeterminate" color="inherit" />
        </Grid>) : (<Grid
          sx={{ display: 'flex', p: (theme) => theme.spacing(3, 3, 3, 3) }}
          container
          spacing={3}
        >
          {/* CPU Usage Card */}
          <Grid item xs={12} sm={6}>
            <Card
              spacing={2}
              sx={{
                px: 2, py: 2, borderRadius: 2, alignItems: 'center',
              }}
            >
              <Typography variant="h6" textAlign="center">
                CPU Usage
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Gauge
                  value={cpuUsage}
                  min={0}
                  max={100}
                  startAngle={-100}
                  endAngle={100}
                  valueLabel={`${cpuUsage.toFixed(2)} %`}
                  cornerRadius="50%"
                  sx={(theme) => ({
                    width: '100%', height: '160px', borderRadius: '8px', [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 20,
                    }, [`& .${gaugeClasses.valueArc}`]: {
                      fill: '#ffffff',
                    },
                  })}
                />
              </div>
            </Card>
          </Grid>

          {/* Memory Usage Card */}
          <Grid item xs={12} sm={6}>
            <Card
              spacing={2}
              sx={{
                px: 2, py: 2, borderRadius: 2, alignItems: 'center',
              }}
            >
              <Typography variant="h6" textAlign="center">
                Memory Usage
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[{ name: 'Used Memory', value: memUsed }, { name: 'Free Memory', value: memFree }]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={30}
                    paddingAngle={5}
                    cornerRadius={5}
                    startAngle={-90}
                    end={180}
                  >
                    {['#FFAB00', '#C4CDD5'].map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      return (<span>
                              {value}: {payload.value.toFixed(2)}%
                            </span>);
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* RAID Health Card */}
          <Grid item xs={12} sm={12}>
            <Card
              spacing={2}
              sx={{
                px: 2, py: 2, borderRadius: 2, alignItems: 'center',
              }}
            >
              <Typography variant="h6" textAlign="center" mb={2}>
                RAID Health
              </Typography>
              {raidHealthData && raidHealthData.length > 0 ? (raidHealthData.map((raid, index) => (
                <Stack direction="column" spacing={1} alignItems="left">
                  <Typography variant="body2">
                    {`RAID Level: ${raid.raidLevel}`}
                  </Typography>
                  <Typography variant="body2">
                    State:{' '}
                    <Label color={raid.state === 'active' ? 'success' : 'warning'}>
                      {raid.state}
                    </Label>
                  </Typography>
                  <Typography variant="body2">
                    {`Array Size: ${raid.arraySize}`}
                  </Typography>
                  <Typography variant="body2">
                    {`Used Device Size: ${raid.usedDevSize}`}
                  </Typography>
                  <Typography variant="body2">
                    {`Active Devices: ${raid.activeDevices}`}
                  </Typography>
                  <Typography variant="body2">
                    {`Working Devices: ${raid.workingDevices}`}
                  </Typography>
                  <Typography variant="body2">
                    {`Failed Devices: ${raid.failedDevices}`}
                  </Typography>
                  <Typography variant="body2">
                    {`Re-Sync Status: ${raid.resyncStatus}`}
                  </Typography>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {raid.disks.map((disk, diskIndex) => (<>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle1">
                          {`Disk: ${disk.device}`}
                        </Typography>
                        <Typography variant="body2">
                          {`Number: ${disk.number}`}
                        </Typography>
                        <Typography variant="body2">
                          {`Major: ${disk.major}`}
                        </Typography>
                        <Typography variant="body2">
                          {`Minor: ${disk.minor}`}
                        </Typography>
                        <Typography variant="body2">
                          {`RAID Device: ${disk.raidDevice}`}
                        </Typography>
                        <Typography variant="body2">
                          {`State: ${disk.state}`}
                        </Typography>
                        <Label color={disk.status === 'Faulty' ? 'error' : 'success'}>
                          Status: {disk.status}
                        </Label>
                      </Stack>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                    </>))}
                </Stack>))) : (<Label color="warning">
                No RAID devices found.
              </Label>)}
            </Card>
          </Grid>
        </Grid>)}
      </DialogContent>
    </LocalizationProvider>
  </Dialog>);
}

SystemMonitor.propTypes = {
  open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired,
};