import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { SERVER_IP } from '../../../config';

export default function AOCCSetup({ onNext }) {
  const [aoccIP, setAOCCIP] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [validationError, setValidationError] = useState('');

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const handleIsEnabledChange = (event) => {
    setIsEnabled(event.target.value === 'true');
  };

  const validateURL = (url) => {
    const regex = /^(https?:\/\/)((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})(:[0-9]{1,5})?$/;
    return regex.test(url);
  };

  useEffect(() => {
    fetch(`${SERVER_IP}/api/config/get-aocc-settings`)
      .then(response => response.json())
      .then(data => {
        setAOCCIP(data.aocc_ip);
        setIsEnabled(!!data.aocc_ip);
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
      });

  }, []);

  const handleSave = () => {

    const apiEndpoint = `${SERVER_IP}/api/config/save-aocc-settings`;

    if (!aoccIP) {
      toast.error('Please fill the required fields.');
      return;
    }

    if (!validateURL(aoccIP)) {
      setValidationError('Invalid URL format. Expected format: http://<ip>:<port> or https://<ip>:<port>.');
      toast.error('Invalid URL format. Expected format: http://<ip>:<port> or https://<ip>:<port>.');
      return;
    }

    setValidationError('');

    fetch(`${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        aoccIP,
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
        onNext();
      })
      .catch(error => {
        toast.error('Error saving/updating settings.');
      });
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <Stack justifyContent="center" sx={{ height: 500 }}>
      <Grid
        sx={{
          display: 'flex', justifyContent: 'space-between', p: (theme) => theme.spacing(5, 5, 5, 5),
        }}
        container
        spacing={5}
      >
        <Grid item xs={12} sm={12}>
          <FormControl>
            <RadioGroup row labelId="aocc-label" name="isEnabled" value={isEnabled} onChange={handleIsEnabledChange}>
              <FormControlLabel value control={<Radio color="error" />} label="Enable" />
              <FormControlLabel value={false} control={<Radio color="error" />} label="Disable" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField fullWidth name="aoccIP" label="AOCC IP Address" value={aoccIP}
                     onChange={(e) => setAOCCIP(e.target.value)} inputProps={{
            maxLength: 50,
          }}  required disabled={!isEnabled} error={!!validationError}
                     helperText={validationError} />
        </Grid>
        <Grid item xs={12} mt={2} sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, p: 5,
        }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <Button variant="contained" color="inherit" disabled={!isEnabled} onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" color="inherit" onClick={handleSkip}>
              Skip
              <ArrowForwardIcon sx={{ ml: 1 }} />
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

AOCCSetup.propTypes = {
  onNext: PropTypes.func.isRequired,
};