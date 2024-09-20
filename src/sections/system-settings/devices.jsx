import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../config';
import TableNoData from './device-view/table-no-data';
import TableEmptyRows from './device-view/table-empty-rows';
import DevicesTableRow from './device-view/devices-table-row';
import DevicesTableHead from './device-view/devices-table-head';
import { emptyRows, applyFilter, getComparator } from './device-view/utils';

export default function Devices() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('deviceId');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [devices, setDevices] = useState([]);

  const [deviceId, setDeviceId] = useState('');

  const [fv, setFV] = useState('');

  const [cameraIP, setCameraIP] = useState('');

  const [isAddDeviceFormOpen, setIsAddDeviceFormOpen] = useState(false);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/devices/get-devices`);
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const openDeviceForm = () => {
  //   setIsAddDeviceFormOpen(true);
  // };

  const closeDeviceForm = () => {
    setDeviceId('');
    setFV('');
    setCameraIP('');
    setIsAddDeviceFormOpen(false);
  };

  const handleSave = () => {
    const apiEndpoint = `${SERVER_IP}/api/devices/save-device`;

    if (!deviceId || !cameraIP || !fv) {
      toast.error('Please fill the required fields.');
      return;
    }

    fetch(`${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        deviceId,
        fv,
        cameraIP,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          toast.success(data.message);
          fetchData();
          closeDeviceForm();
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.log('Error updating device:', error);
      });
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
    inputData: devices,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h5">Devices</Typography>
      </Stack>
      <Toolbar sx={{ paddingLeft: '0px !important' }}>
        <Grid
          sx={{
            display: 'flex', p: (theme) => theme.spacing(3, 0, 3, 0),
          }}
          container
          alignItems="center"
        >
          <Grid item xs={12} sm={6}>
            <OutlinedInput
              fullWidth
              value={filterName}
              onChange={handleFilterByName}
              placeholder="Search Device.."
              startAdornment={<InputAdornment position="start">
                <SearchIcon
                  sx={{ width: 20, height: 20 }}
                />
              </InputAdornment>}
            />
          </Grid>
        </Grid>
      </Toolbar>
      <TableContainer sx={{ overflow: 'unset', marginBottom: '5px' }}>
        <Table size="small">
          <DevicesTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleSort} 
            headLabel={[
              { id: 'deviceId', label: 'Device Id' },
              { id: 'fv', label: 'Firmware Version' },
              { id: 'deviceIp', label: 'Device IP' },
              { id: 'cameraIp', label: 'Camera IP' },
              { id: '' }
            ]}
          />
          <TableBody>
            {dataFiltered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <DevicesTableRow
                  key={row.id}
                  id={row.id}
                  deviceId={row.svdgs_id}
                  fv={row.fw_version}
                  deviceIp={row.socket_ip}
                  cameraIp={row.camera_ip}
                  fetchData={fetchData}
                />
              ))}

            <TableEmptyRows
              height={77}
              emptyRows={emptyRows(page, rowsPerPage, devices.length)}
            />

            {notFound && <TableNoData query={filterName} />}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        page={page}
        component="div"
        count={devices.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={isAddDeviceFormOpen} onClose={closeDeviceForm} maxWidth="md">
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
            Add Device
          </DialogTitle>
          <DialogContent>
            <Grid
              sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
              container
              spacing={3}
            >
              <Grid item xs={12} sm={8}>
                <TextField fullWidth name="deviceId" label="Device Id" value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)} inputProps={{
                    maxLength: 250,
                  }} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth name="fv" label="Firmware Version" value={fv}
                  onChange={(e) => setFV(e.target.value)} inputProps={{
                    maxLength: 250,
                  }} required />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField fullWidth name="cameraURL" label="Camera IP" value={cameraIP}
                  onChange={(e) => setCameraIP(e.target.value)} inputProps={{
                    maxLength: 250,
                  }} required />
              </Grid>
              <Grid item xs={12} mt={2}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                  <Button variant="contained" color="inherit" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="outlined" color="inherit" onClick={closeDeviceForm}>
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </LocalizationProvider>
      </Dialog>
    </Container>
  );
}