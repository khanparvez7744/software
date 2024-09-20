import PropTypes from 'prop-types';
import { CSVLink } from 'react-csv';
import React, { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import TableBody from '@mui/material/TableBody';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import OutlinedInput from '@mui/material/OutlinedInput';
import DownloadIcon from '@mui/icons-material/Download';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import TableNoData from '../table-no-data';
import { SERVER_IP } from '../../../../config';
import TableEmptyRows from '../table-empty-rows';
import Scrollbar from '../../../components/scrollbar';
import { fDateTime } from '../../../utils/format-time';
import SensorReportTableRow from '../sensor-report-table-row';
import SensorReportTableHead from '../sensor-report-table-head';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function SensorReportPage({ open, onClose }) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [orderBy, setOrderBy] = useState('dateTime');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [sensorData, setSensorData] = useState([]);

  const [fromDate, setFromDate] = useState(null);

  const [toDate, setToDate] = useState(null);

  const formatAndAdjustTimezone = (date) => {
    if (!date) return null; // Return empty string if date is empty

    const utcDate = new Date(date);
    const nextDay = new Date(utcDate);
    nextDay.setHours(24, 0, 0, 0);  // Set hours, minutes, seconds, and milliseconds to 0
    return nextDay.toISOString().slice(0, 10);  // Format as 'YYYY-MM-DD'
  };

  const fetchData = useCallback(async () => {

    const formattedFromDate = formatAndAdjustTimezone(fromDate);
    const formattedToDate = formatAndAdjustTimezone(toDate);

    const requestBody = {
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    };

    try {
      const response = await fetch(`${SERVER_IP}/api/reports/get-device-reports/sensor-reports`, {
        method: 'POST', // Specify the HTTP method as POST
        headers: {
          'Content-Type': 'application/json', // Set the content type of the request body
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      setSensorData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },  [fromDate, toDate]);

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      // Cleanup function to clear all data and filters when the dialog is closed
      setSensorData([]);
      handleClearAll();
    }
  }, [fetchData, open]);

  const handleClearAll = () => {
    setFromDate(null);
    setToDate(null);
    setFilterName('');
    setPage(0);
    setRowsPerPage(5);
    setOrder('desc');
    setOrderBy('dateTime');
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: sensorData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const prepareCSVData = () => {
    const headers = [
      { label: 'Stand', key: 'standName' },
      { label: 'Device', key: 'deviceId' },
      { label: 'CPU Temperature', key: 'cpuTemp' },
      { label: 'GPU Temperature', key: 'gpuTemp' },
      { label: 'Lidar Temperature', key: 'lidarTemp' },
      { label: 'Chamber Temperature', key: 'chamberTemp' },
      { label: 'Chamber Humidity', key: 'chamberHumid' },
      { label: 'Fan Status', key: 'fanStatus' },
      { label: 'Date Time', key: 'dateTime' },
    ];

    const csvData = dataFiltered.map(row => ({
      standName: row.name,
      deviceId: row.svdgs_id,
      cpuTemp: row.cpu_temp,
      gpuTemp: row.gpu_temp,
      lidarTemp: row.lidar_temp,
      chamberTemp: row.chamber_temp,
      chamberHumid: row.chamber_humidity,
      fanStatus: row.fan_status,
      dateTime: fDateTime(row.dateTime, 'dd MMM yyyy HH:mm:ss'),
    }));

    return { headers, data: csvData };
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DialogTitle variant="h4" sx={{
          display: 'flex',
          justifyContent: 'center',
        }} mt={2} mb={2}>
          Sensor Report
        </DialogTitle>
        <DialogContent>
          <Toolbar sx={{ paddingLeft: '0px !important', paddingRight: '0px !important' }}>
            <Grid
              sx={{
                display: 'flex', p: (theme) => theme.spacing(3, 1, 3, 1),
              }}
              container
              spacing={2}
              alignItems="center"
            >
              <Grid item xs={12} md={6}>
                <OutlinedInput
                  fullWidth
                  value={filterName}
                  onChange={handleFilterByName}
                  placeholder="Search Stand.."
                  startAdornment={<InputAdornment position="start">
                    <SearchIcon
                      sx={{ width: 20, height: 20 }}
                    />
                  </InputAdornment>}
                />
              </Grid>
              <Grid item xs={12} md={6} />
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <DatePicker
                    label="From Date"
                    value={fromDate}
                    onChange={(date) => setFromDate(date)}
                    format="D/M/YYYY"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <DatePicker
                    label="To Date"
                    value={toDate}
                    onChange={(date) => setToDate(date)}
                    format="D/M/YYYY"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" justifyContent="right" spacing={2}>
                  {fromDate && toDate && (
                    <Button variant="text" color="inherit" onClick={handleClearAll}>
                      Clear Filters
                    </Button>
                  )}
                  <Button variant="contained" color="inherit" onClick={fetchData} >
                    Apply Filters
                  </Button>
                  <CSVLink
                    filename={`sensor_report_${new Date().toISOString()}.csv`}
                    {...prepareCSVData()}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="contained" color="success" startIcon={<DownloadIcon />}>
                      Export
                    </Button>
                  </CSVLink>
                </Stack>
              </Grid>
            </Grid>
          </Toolbar>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table>
                <SensorReportTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleSort}
                  headLabel={[
                    { id: 'standName', label: 'Stand Name' },
                    { id: 'deviceId', label: 'Device Id' },
                    { id: 'cpuTemp', label: 'CPU Temp.' },
                    { id: 'gpuTemp', label: 'GPU Temp.' },
                    { id: 'lidarTemp', label: 'Lidar Temp.' },
                    { id: 'chamberTemp', label: 'Chamber Temp.' },
                    { id: 'chamberHumid', label: 'Chamber Humidity' },
                    { id: 'fanStatus', label: 'Fan Status' },
                    { id: 'dateTime', label: 'Date Time' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <SensorReportTableRow
                        key={row.id}
                        standName={row.name}
                        deviceId={row.svdgs_id}
                        cpuTemp={row.cpu_temp}
                        gpuTemp={row.gpu_temp}
                        lidarTemp={row.lidar_temp}
                        chamberTemp={row.chamber_temp}
                        chamberHumid={row.chamber_humidity}
                        fanStatus={row.fan_status}
                        dateTime={row.dateTime}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, sensorData.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            page={page}
            component="div"
            count={sensorData.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
      </LocalizationProvider>
    </Dialog>
  );
}

SensorReportPage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
