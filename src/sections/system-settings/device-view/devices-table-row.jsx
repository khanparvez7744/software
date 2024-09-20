import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../../config';
import { bgGradient } from '../../../theme/css';
 
// ----------------------------------------------------------------------

export default function DevicesTableRow({
                                          id, deviceId, fv, deviceIp, cameraIp, fetchData,
                                        }) {
  const theme = useTheme();
  const [open, setOpen] = useState(null);
  const [isDeviceFormOpen, setIsDeviceFormOpen] = useState(false);

  const [dId, setDeviceId] = useState('');

  const [fwV, setFV] = useState('');

  const [cIP, setCameraIP] = useState('');

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const closeDeviceForm = () => {
    setDeviceId('');
    setFV('');
    setCameraIP('');
    setIsDeviceFormOpen(false);
  };

  const handleEdit = () => {
    setOpen(null);
    setIsDeviceFormOpen(true);

    fetch(`${SERVER_IP}/api/devices/get-device/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setDeviceId(data.svdgs_id);
        setFV(data.fw_version);
        setCameraIP(data.camera_ip);
      })
      .catch((error) => {
        console.error('Error fetching flight data:', error);
      });
  };

  const handleSave = () => {
    const apiEndpoint = `${SERVER_IP}/api/devices/update-device/${id}`;
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!dId || !cIP || !fwV) {
      toast.error('Please fill the required fields.');
      return;
    }

    if (!ipPattern.test(cIP)) {
      toast.error('Invalid Camera IP address.');
      return;
    }


    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId, deviceId: dId, fv: fwV, cameraIP: cIP,
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
        console.log('Error updating flight:', error);
      });
  };

  const handleDelete = () => {
    fetch(`${SERVER_IP}/api/devices/delete-device/${id}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId,
      }),
    })
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            toast.success(data.message);
            fetchData();
          } else {
            toast.warning(data.message || 'Cannot delete device.');
          }
        }))
      .catch(error => {
        toast.error('Cannot delete device.');
      });
  };


  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const isIpValid = (cIp) => {
    if (!cIp) {
      return true;
    }

    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(cIp);
  };

  return (<>
    <TableRow>
      <TableCell> {deviceId || '-'} </TableCell>

      <TableCell> {fv || '-'} </TableCell>

      <TableCell> {deviceIp || '-'} </TableCell>

      <TableCell> {cameraIp || '-'} </TableCell>

      <TableCell align="right">
        <IconButton onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton>
      </TableCell>

    </TableRow>

    <Popover
      open={!!open}
      anchorEl={open}
      onClose={handleCloseMenu}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          width: 140, ...bgGradient({
            color: alpha(theme.palette.background.default, 0.99), imgUrl: './assets/background/overlay_4.jpg',
          }),
        },
      }}
    >
      <MenuItem onClick={handleEdit}>
        <EditIcon sx={{ mr: 2 }} />
        Edit
      </MenuItem>

      <MenuItem onClick={handleDelete} sx={{ color: 'error.mainOrange' }}>
        <DeleteOutlineIcon sx={{ mr: 2 }} />
        Delete
      </MenuItem>
    </Popover>

    <Dialog open={isDeviceFormOpen} onClose={closeDeviceForm} maxWidth="md">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
          Edit Device
        </DialogTitle>
        <DialogContent>
          <Grid
            sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
            container
            spacing={3}
          >
            <Grid item xs={12} sm={8}>
              <TextField fullWidth name="deviceId" label="Device Id" value={dId}
                         onChange={(e) => setDeviceId(e.target.value)} inputProps={{
                maxLength: 250,
              }} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth name="fv" label="Firmware Version" value={fwV}
                         onChange={(e) => setFV(e.target.value)} inputProps={{
                maxLength: 250,
              }} required />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                name="cameraURL"
                label="Camera IP"
                value={cIP}
                onChange={(e) => setCameraIP(e.target.value)}
                inputProps={{ maxLength: 250, }}
                error={!isIpValid(cIP)}
                helperText={!isIpValid(cIP) ? 'Invalid IP Format' : ''}
                required
              />
            </Grid>
            <Grid item xs={12} mt={2}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                <Button variant="contained" color="inherit" onClick={handleSave}>
                  Update
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
  </>);
}

DevicesTableRow.propTypes = {
  id: PropTypes.any,
  deviceId: PropTypes.any,
  fv: PropTypes.any,
  deviceIp: PropTypes.any,
  cameraIp: PropTypes.any,
  fetchData: PropTypes.func,
};
