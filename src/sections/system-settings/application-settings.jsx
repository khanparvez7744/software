import { toast } from 'sonner'
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';

import { SERVER_IP } from '../../../config';

export default function ApplicationSettings() {
  const [airportName, setAirportName] = useState('');
  const [airportCode, setAirportCode] = useState('');
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  useEffect(() => {
    fetch(`${SERVER_IP}/api/countries/get-countries`)
      .then(response => response.json())
      .then(data => {
        setCountries(data);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
    fetch(`${SERVER_IP}/api/config/get-application-settings`)
      .then(response => response.json())
      .then(data => {
        setAirportName(data.airport_name);
        setAirportCode(data.airport_code);
        setSelectedCountry(data.country_id);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const handleSave = () => {

    const apiEndpoint = `${SERVER_IP}/api/config/save-application-settings`;

    if (!airportName || !airportCode || !selectedCountry) {
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
        airportName,
        airportCode,
        countryId: selectedCountry,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        toast.success(data.message);
      })
      .catch(error => {
        toast.error('Error saving/updating settings.');
      });
  };

  return (<Container>
    <Stack direction="row" alignItems="center" justifyContent="space-between" ml={3} mb={1}>
      <Typography variant="h5">Application Settings</Typography>
    </Stack>
    <Grid
      sx={{
        display: 'flex', justifyContent: 'space-between', p: (theme) => theme.spacing(3, 3, 3, 3),
      }}
      container
      spacing={3}
    >
      <Grid item xs={12} sm={12}>
        <TextField fullWidth name="airportName" label="Airport Name" value={airportName}
                   onChange={(e) => setAirportName(e.target.value)} inputProps={{
          maxLength: 250,
        }} required />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <Autocomplete
            id="country-label"
            options={countries}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Country" />}
            value={selectedCountry ? countries.find(country => country.id === selectedCountry) : null}
            onChange={(event, newValue) => {
              setSelectedCountry(newValue ? newValue.id : '');
            }}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField fullWidth name="airportCode" label="Airport Code" value={airportCode}
                   onChange={(e) => setAirportCode(e.target.value)} inputProps={{
          maxLength: 20,
        }} required />
      </Grid>
      <Grid item xs={12} mt={2}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
          <Button variant="contained" color="inherit" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Grid>
    </Grid>
    </Container>
  );
}

ApplicationSettings.propTypes = {

};
