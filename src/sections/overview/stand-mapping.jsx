import 'dayjs/locale/en-gb';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LinkIcon from '@mui/icons-material/Link';
import RadioGroup from '@mui/material/RadioGroup';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { SERVER_IP } from '../../../config';

export default function StandMapping({ open, onClose, selectedId }) {
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState('');
  const [selectedLStand, setSelectedLStand] = useState('');
  const [selectedRStand, setSelectedRStand] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedLDevice, setSelectedLDevice] = useState('');
  const [selectedRDevice, setSelectedRDevice] = useState('');
  const [isMarsEnabled, setIsMarsEnabled] = useState(false);
  const [isMapped, setIsMapped] = useState(false);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const handleIsMarsEnabledChange = (event) => {
    setIsMarsEnabled(event.target.value === 'true');
  };

  useEffect(() => {
    if (open) {
      fetch(`${SERVER_IP}/api/stands/get-stands`)
        .then(response => response.json())
        .then(data => {
          setStands(data);
        })
        .catch(error => {
          console.error('Error fetching stands:', error);
        });
      fetch(`${SERVER_IP}/api/devices/get-devices`)
        .then(response => response.json())
        .then(data => {
          setDevices(data);
        })
        .catch(error => {
          console.error('Error fetching devices:', error);
        });
      if (selectedId) {
        fetch(`${SERVER_IP}/api/device-mapping/get-device-mapping/${selectedId}`)
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              setIsMapped(false);
              console.error('Error fetching stands:', data.error);
            } else if (data.length === 1) {
              setIsMapped(true);
              setIsMarsEnabled(false);
              setSelectedStand(data[0].stand_id);
              setSelectedDevice(data[0].device_id);
            } else if (data.length === 3) {
              setIsMapped(true);
              setIsMarsEnabled(true);
              data.forEach((item, index) => {
                if (item.stand_position === 'R') {
                  setSelectedRStand(data[index].stand_id);
                  setSelectedRDevice(data[index].device_id);
                } else if (item.stand_position === 'L') {
                  setSelectedLStand(data[index].stand_id);
                  setSelectedLDevice(data[index].device_id);
                } else {
                  setSelectedStand(data[index].stand_id);
                  setSelectedDevice(data[index].device_id);
                }
              });
            }
          })
          .catch(error => {
            console.error('Error fetching stands:', error);
          });
      }
    } else {
      setIsMarsEnabled(false);
      setIsMapped(false);
      setStands([]);
      setSelectedStand('');
      setSelectedDevice('');
      setSelectedRStand('');
      setSelectedRDevice('');
      setSelectedLStand('');
      setSelectedLDevice('');
    }
  }, [open, selectedId]);

  const handleDelete = () => {
    const apiEndpoint = `${SERVER_IP}/api/device-mapping/delete-mapping/${selectedId}`;

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          toast.success(data.message);
          setIsMarsEnabled(false);
          setIsMapped(false);
          setStands([]);
          setSelectedStand('');
          setSelectedDevice('');
          setSelectedRStand('');
          setSelectedRDevice('');
          setSelectedLStand('');
          setSelectedLDevice('');
          onClose();
        } else {
          toast.error(data.error);
        }
      });
  };

  const handleSave = () => {
    const apiEndpoint = `${SERVER_IP}/api/device-mapping/map-device`;

    if (!selectedStand || !selectedDevice || (isMarsEnabled ? !selectedLStand || !selectedRStand || !selectedLDevice || !selectedRDevice : 0)) {
      toast.error('Please fill the required fields.');
      return;
    }
    let body;
    if (isMarsEnabled) {
      body = [{
        userId, deviceId: selectedDevice, standId: selectedStand, standPosition: null, svgId: selectedId,
      }, {
        userId, deviceId: selectedLDevice, standId: selectedLStand, standPosition: 'L', svgId: selectedId,
      }, {
        userId, deviceId: selectedRDevice, standId: selectedRStand, standPosition: 'R', svgId: selectedId,
      }];
    } else {
      body = [{
        userId, deviceId: selectedDevice, standId: selectedStand, svgId: selectedId,
      }];
    }

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify(body),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          toast.success(data.message);
          onClose();
        } else {
          toast.error(data.error);
        }
      });
  };

  return (<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle variant="h5" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
      Map: {selectedId}
    </DialogTitle>
    <DialogContent>
      <Grid
        sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
        container
        spacing={3}
      >
        <Grid item xs={12} sm={12}>
          <FormControl>
            <RadioGroup row labelId="mars-label" name="isMarsEnabled" value={isMarsEnabled}
              onChange={handleIsMarsEnabledChange}>
              <FormControlLabel value control={<Radio color="error" />} label="Mars Stand" />
              <FormControlLabel value={false} control={<Radio color="error" />} label="Single Stand" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl fullWidth required>
            <InputLabel id="stand-label">Stand</InputLabel>
            <Select
              labelId="stand-label"
              id="stand"
              label="Stand"
              value={selectedStand}
              disabled={isMapped}
              onChange={(e) => setSelectedStand(e.target.value)}
            >
              {stands.map((stand) => (<MenuItem key={stand.id} value={stand.id}>
                {stand.name}
              </MenuItem>))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12}>
          <FormControl fullWidth required>
            <InputLabel id="device-label">Device</InputLabel>
            <Select
              labelId="device-label"
              id="device"
              label="Device"
              value={selectedDevice}
              disabled={isMapped}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {devices.map((device) => (<MenuItem key={device.id} value={device.id}>
                {device.svdgs_id}
              </MenuItem>))}
            </Select>
          </FormControl>
        </Grid>
        {isMarsEnabled && (<Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="stand-label">L Stand</InputLabel>
            <Select
              labelId="stand-label"
              id="stand"
              label="L Stand"
              value={selectedLStand}
              disabled={isMapped}
              onChange={(e) => setSelectedLStand(e.target.value)}
            >
              {stands.map((stand) => (<MenuItem key={stand.id} value={stand.id}>
                {stand.name}
              </MenuItem>))}
            </Select>
          </FormControl>
        </Grid>)}
        {isMarsEnabled && (<Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="device-label">L Device</InputLabel>
            <Select
              labelId="device-label"
              id="device"
              label="L Device"
              value={selectedLDevice}
              disabled={isMapped}
              onChange={(e) => setSelectedLDevice(e.target.value)}
            >
              {devices.map((device) => (<MenuItem key={device.id} value={device.id}>
                {device.svdgs_id}
              </MenuItem>))}
            </Select>
          </FormControl>
        </Grid>)}
        {isMarsEnabled && (<Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="stand-label">R Stand</InputLabel>
            <Select
              labelId="stand-label"
              id="stand"
              label="R Stand"
              value={selectedRStand}
              disabled={isMapped}
              onChange={(e) => setSelectedRStand(e.target.value)}
            >
              {stands.map((stand) => (<MenuItem key={stand.id} value={stand.id}>
                {stand.name}
              </MenuItem>))}
            </Select>
          </FormControl>
        </Grid>)}
        {isMarsEnabled && (<Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="device-label">R Device</InputLabel>
            <Select
              labelId="device-label"
              id="device"
              label="R Device"
              value={selectedRDevice}
              disabled={isMapped}
              onChange={(e) => setSelectedRDevice(e.target.value)}
            >
              {devices.map((device) => (<MenuItem key={device.id} value={device.id}>
                {device.svdgs_id}
              </MenuItem>))}
            </Select>
          </FormControl>
        </Grid>)}
        <Grid item xs={12} mt={2}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <Button variant="contained" color={isMapped ? 'error' : 'inherit'}
              onClick={isMapped ? handleDelete : handleSave}>
              {isMapped ? <LinkOffIcon sx={{ mr: 1 }} /> : <LinkIcon sx={{ mr: 1 }} />}
              {isMapped ? 'Unlink' : 'Link'}
            </Button>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </DialogContent>
  </Dialog>);
}

StandMapping.propTypes = {
  open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, selectedId: PropTypes.any,
};
