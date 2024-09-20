import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import { toast } from 'sonner'
import PropTypes from 'prop-types';
import utc from 'dayjs/plugin/utc';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../config';

dayjs.extend(utc);

export default function ScheduleFlight({ open, onClose }) {
  const [scheduleType, setScheduleType] = useState('');
  const [flightId, setFlightId] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState('');
  const [ST, setST] = useState(null);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  useEffect(() => {
    if (open) {
      fetch(`${SERVER_IP}/api/stands/get-stands`)
        .then(response => response.json())
        .then(data => {
          setStands(data);
        })
        .catch(error => {
          console.error('Error fetching countries:', error);
        });
    } else {
      setFlightId('');
      setScheduleType('');
      setFlightNumber('');
      setSelectedAircraft('');
      setSelectedStand('');
      setST(null);
      setStands([]);
    }
  }, [open]);

  const generateFlightId = (type) => {
    const currentDateTime = dayjs().format('YYYYMMDDHHmmss');
    if (type === 'Arrival') {
      setScheduleType('A');
      setFlightId(`ARRD_${currentDateTime}`);
    } else if (type === 'Departure') {
      setScheduleType('D');
      setFlightId(`DEPD_${currentDateTime}`);
    }
  };


  const handleSchedule = () => {
    const apiEndpoint = `${SERVER_IP}/api/flights/schedule-flight`;

    if (!flightId || !selectedAircraft || !selectedStand || !flightNumber || !ST ) {
      toast.error('Please fill the required fields.');
      return;
    }

    const formattedST = dayjs(ST).utc().format('YYYY-MM-DDTHH:mm:ss');

    fetch(`${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        scheduleType,
        flightId,
        flightNumber,
        standId: selectedStand,
        st: formattedST,
        aircraftType: selectedAircraft,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if(data.message){
          toast.success(data.message);
          onClose();
        }
        else{
          toast.error(data.error);
        }

      })
      .catch(error => {
        console.log('in error', error);

      });
  };

  const handleStandChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedStand(selectedValue);
    setAircraftTypes([]);
    handleSetAircraft(selectedValue);
  };

  const handleSetAircraft = async (selectedValue) => {

    if (!selectedValue) {
      toast.warning('Please select a stand.');
      return;
    }

    try {
      const response = await fetch(`${SERVER_IP}/api/aircraft/get-aircraft-by-stand/${selectedValue}`);
      const data = await response.json();
      setAircraftTypes(data);
    } catch (error) {
      console.error('Error fetching aircraft types:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DialogTitle variant="h4" sx={{
        display: 'flex',
        justifyContent: 'center',
      }} mt={2} mb={2}>
        Schedule Flight
      </DialogTitle>
      <DialogContent>
        <Grid
          sx={{
            display: 'flex',
            p: (theme) => theme.spacing(3, 3, 3, 3),
          }}
          container
          spacing={3}
        >
          <Grid item xs={12} sm={5}>
            <FormControl>
              <FormLabel id="scheduleType" sx={{ color: 'inherit' }} required>Schedule Type</FormLabel>
            </FormControl>
            <FormControl required>
              <RadioGroup
                row
                onChange={(e) => generateFlightId(e.target.value === 'Arrival' ? 'Arrival' : 'Departure')}
              >
                <FormControlLabel value="Arrival" control={<Radio color="error" />} label="Arrival" />
                <FormControlLabel value="Departure" control={<Radio color="error" />} label="Departure" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField fullWidth name="flightId" label="Flight Id" value={flightId} onChange={(e) => setFlightId(e.target.value)} inputProps={{
              maxLength: 25,
            }} required disabled/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="flightNumber" label="Flight Number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} inputProps={{
              maxLength: 20,
            }} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="stand-label">Stand</InputLabel>
              <Select
                labelId="stand-label"
                id="stand"
                label="Stand"
                value={selectedStand}
                onChange={handleStandChange}
              >
                {stands.map(stand => (<MenuItem key={stand.id} value={stand.id}>
                  {stand.name}
                </MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="aircarft-label">Aircraft Type</InputLabel>
              <Select
                labelId="aircarft-label"
                id="aircarft"
                label="Aircraft Type"
                value={selectedAircraft}
                onChange={(e) => setSelectedAircraft(e.target.value)}
              >
                {(!selectedStand || aircraftTypes.length === 0) ? (
                  <MenuItem disabled>
                    Please select a stand
                  </MenuItem>
                ) : (
                  aircraftTypes.map((aircraftType) => (
                    <MenuItem key={aircraftType.id} value={aircraftType.name}>
                      {aircraftType.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <DateTimePicker
                label="Schedule Time *"
                value={ST}
                onChange={(date) => setST(date)}
                ampm={false}
                inputFormat="DD/MM/YYYY HH:mm"
                minDateTime={dayjs()}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} mt={2}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleSchedule}>
                Schedule
              </Button>
              <Button variant="outlined" color="inherit" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      </LocalizationProvider>
    </Dialog>
  );
}

ScheduleFlight.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
