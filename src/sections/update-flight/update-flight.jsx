import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';
import { toast } from 'sonner'
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../config';


export default function UpdateFlight({ open, onClose }) {
  const [flightNumber, setFlightNumber] = useState('');
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [stands, setStands] = useState([]);
  const [selectedStand, setSelectedStand] = useState('');
  const [stad, setSTAD] = useState(null);
  const [etad, setETAD] = useState(null);
  const [arrdep] = useState([
    { id: 'A', name: 'Arrival' },
    { id: 'D', name: 'Departure' }
  ]);
  const [selectedArrDep, setSelectedArrDep] = useState('');

  const [statuses] = useState([
    { id: 'A', name: 'Active' },
    { id: 'C', name: 'Cancel' }
  ]);
  const [selectedStatus, setSelectedStatus] = useState('');

  const [qualifiers] = useState([
    { id: 'O', name: 'Operational' },
    { id: 'X', name: 'Non-Operational' }
  ]);
  const [selectedQualifier, setSelectedQualifier] = useState('');

  const [searchValue, setSearchValue] = useState('');
  const [flightOptions, setFlightOptions] = useState([]);

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
      setFlightNumber('');
      setSelectedAircraft('');
      setStands([]);
      setSelectedStand('');
      setSTAD(null);
      setETAD(null);
      setSelectedArrDep('');
      setSearchValue('');
      setFlightOptions([]);
      setSelectedStatus('');
      setSelectedQualifier('');
    }
  }, [open]);

  const handleSearch = () => {
    fetch(`${SERVER_IP}/api/flights/get-flight/${searchValue}`)
      .then(response => response.json())
      .then(data => {
        setFlightNumber(data.flightNumber);
        setSelectedArrDep(data.arrDep);
        setSelectedStand(data.standId);
        setSTAD(dayjs(data.stAd));
        if (data.etAd != null) {
          setETAD(dayjs(data.etAd));
        }
        setSelectedStatus(data.flightStatus);
        setSelectedQualifier(data.flightQualifier);
        fetchAircraftByStand(data.standId, data.aircraftType);
      })
      .catch(error => {
        console.error('Error fetching flight data:', error);
      });
  };

  const fetchFlightOptions = (query) => {
    fetch(`${SERVER_IP}/api/flights/search-flight/${query}`)
      .then((response) => response.json())
      .then((data) => {
        setFlightOptions(data);
      })
      .catch((error) => console.error('Error fetching flight options:', error));
  };

  const handleUpdate = () => {

    const apiEndpoint = `${SERVER_IP}/api/flights/update-flight`;

    if (!flightNumber || !selectedAircraft || !selectedStand || !selectedArrDep) {
      toast.error('Please fill the required fields.');
      return;
    }
    const formattedStad = dayjs(stad).utc().format('YYYY-MM-DDTHH:mm:ss');
    const formattedEtad = etad ? dayjs(etad).utc().format('YYYY-MM-DDTHH:mm:ss') : null;

    fetch(`${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        flightId:searchValue,
        flightNumber,
        arrDep: selectedArrDep,
        standId: selectedStand,
        stAd: formattedStad,
        etAd: formattedEtad,
        aircraftType: selectedAircraft,
        flightStatus:selectedStatus,
        flightQualifier:selectedQualifier
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
        console.log('Error updating flight:', error);
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

  const fetchAircraftByStand = async (standId, aircraft) => {
    if (!standId) {
      toast.warning('Please select a stand.');
      return;
    }

    try {
      const response = await fetch(`${SERVER_IP}/api/aircraft/get-aircraft-by-stand/${standId}`);
      const data = await response.json();
      setAircraftTypes(data);
      if (aircraft) {
        setSelectedAircraft(aircraft);
      }
    } catch (error) {
      console.error('Error fetching aircraft types:', error);
    }
  };

  return (<Dialog open={open} onClose={onClose} maxWidth="md">
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
        Update Flight
      </DialogTitle>
      <DialogContent>
        <Grid
          sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
          container
          spacing={3}
        >
          <Grid item xs={12} sm={12}>
            <Stack direction="row" alignItems="center" justifyContent="center" mb={1} spacing={2}>
              <FormControl sx={{ width: '50%' }} required>
                <Autocomplete
                  options={flightOptions}
                  getOptionLabel={(option) => option.flightId || ''}
                  onInputChange={(event, newInputValue) => {
                    setSearchValue(newInputValue);
                    fetchFlightOptions(newInputValue);
                  }}
                  onChange={(event, newValue) => {
                    setSearchValue(newValue ? newValue.flightId : '');
                  }}
                  renderInput={(params) => <TextField {...params} label="Flight ID" />}
                />
              </FormControl>
              <Button variant="contained" color="inherit" onClick={() => handleSearch(searchValue)}>
                Search
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              name="flightNumber"
              label="Flight Number"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              inputProps={{ maxLength: 20 }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required disabled>
              <InputLabel id="arrdep-label">Arrival/Departure</InputLabel>
              <Select
                labelId="arrdep-label"
                id="arrdep"
                label="Arrival/Departure"
                value={selectedArrDep}
                onChange={(e) => setSelectedArrDep(e.target.value)}
              >
                {arrdep.map((ad) => (<MenuItem key={ad.id} value={ad.id}>
                  {ad.name}
                </MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel id="stand-label">Stand</InputLabel>
              <Select
                labelId="stand-label"
                id="stand"
                label="Stand"
                value={selectedStand}
                onChange={handleStandChange}
              >
                {stands.map((stand) => (<MenuItem key={stand.id} value={stand.id}>
                  {stand.name}
                </MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <DateTimePicker
                label="Schedule Time"
                value={stad}
                onChange={(date) => setSTAD(date)}
                ampm={false}
                inputFormat="DD/MM/YYYY HH:mm"
                minDateTime={dayjs()}
                renderInput={(params) => <TextField {...params} />}
                disabled
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <DateTimePicker
                label="Estimated Time"
                value={etad}
                onChange={(date) => setETAD(date)}
                ampm={false}
                inputFormat="DD/MM/YYYY HH:mm"
                minDateTime={dayjs()}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="status-label">Flight Status</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                label="Flight Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map((status) => (<MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel id="qualifier-label">Flight Qualifier</InputLabel>
              <Select
                labelId="qualifier-label"
                id="qualifier"
                label="Flight Qualifier"
                value={selectedQualifier} 
                onChange={(e) => setSelectedQualifier(e.target.value)}
              >
                {qualifiers.map((qualifier) => (<MenuItem key={qualifier.id} value={qualifier.id}>
                  {qualifier.name}
                </MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} mt={2}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handleUpdate}>
                Update
              </Button>
              <Button variant="outlined" color="inherit" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </LocalizationProvider>
  </Dialog>);
}

UpdateFlight.propTypes = {
  open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired,
};
