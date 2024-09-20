import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { SERVER_IP } from '../../../config';

export default function AOCCConfig() {
  const [aoccIP, setAOCCIP] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const handleIsEnabledChange = (event) => {
    const { value } = event.target;
    if (value === 'false') {
      setOpenConfirmDialog(true);
    } else {
      setIsEnabled(true);
    }
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
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
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
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
      })
      .catch(error => {
        toast.error('Error saving/updating settings.');
      });
  };

  const handleDisable = () => {

    const apiEndpoint = `${SERVER_IP}/api/config/delete-aocc-settings`;

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId,
      }),
    })
      .then(response => response.json())
      .then(data => {
        toast.warning(data.message);
        handleCloseConfirmDialog();
        setAOCCIP('');
        setIsEnabled(false);
      })
      .catch(error => {
        toast.error('Cannot delete user.');
      });
  };

  return (<Container >
    <Stack direction="row" alignItems="center" justifyContent="space-between" ml={3} mb={1}>
      <Typography variant="h5">AOCC</Typography>
    </Stack>
    <Grid
      sx={{
        display: 'flex', justifyContent: 'space-between', p: (theme) => theme.spacing(3, 3, 3, 3),
      }}
      container
      spacing={3}
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
          }} required disabled={!isEnabled} error={!!validationError}
          helperText={validationError} />
      </Grid>
      <Grid item xs={12} mt={2}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
          <Button variant="contained" color="inherit" disabled={!isEnabled} onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Grid>
    </Grid>
    <Dialog
      open={openConfirmDialog}
      onClose={handleCloseConfirmDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ textAlign: 'center' }}>Confirm AOCC Disable!</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" alignItems="center" justifyContent="center" mt={2}>
          <Typography>
            Are you sure you want to disable this feature?
          </Typography>
          <Stack direction="row" mt={4} spacing={2}>
            <Button variant="contained" color="warning" onClick={handleDisable} autoFocus>
              Confirm
            </Button>
            <Button variant="outlined" color="inherit" onClick={handleCloseConfirmDialog}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  </Container>);
}