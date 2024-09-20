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
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import Label from '../../../components/label';
import { SERVER_IP } from '../../../../config';
import { bgGradient } from '../../../theme/css';

// ----------------------------------------------------------------------

export default function StandsTableRow({
                                         standId, standName, aoccStandCode, pbb, aircraft, fetchData,
                                       }) {
  const theme = useTheme();
  const [open, setOpen] = useState(null);
  const [isStandFormOpen, setIsStandFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [standCode, setStandCode] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [selectedAircraftTypes, setSelectedAircraftTypes] = useState([]);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const closeStandForm = () => {
    setName('');
    setStandCode('');
    setLongitude('');
    setLatitude('');
    setSelectedAircraftTypes([]);
    setIsStandFormOpen(false);
  };

  const handleEdit = () => {
    setOpen(null);
    setIsStandFormOpen(true);

    // Fetch aircraft types and stand data simultaneously
    Promise.all([fetch(`${SERVER_IP}/api/aircraft/get-aircraft-types`).then(response => response.json()), fetch(`${SERVER_IP}/api/stands/get-stand/${standId}`).then(response => response.json())])
      .then(([aircraftTypesData, standData]) => {
        // Set aircraft types
        setAircraftTypes(aircraftTypesData);

        // Set stand data
        setName(standData.name);
        setStandCode(standData.aocc_code);
        setLatitude(standData.latitude);
        setLongitude(standData.longitude);

        // Map the ac_id array to the aircraft types
        const acIdArray = standData.ac_id ? standData.ac_id.split(',').map(id => parseInt(id, 10)) : [];
        const selectedTypes = acIdArray.map(id => aircraftTypesData.find(type => type.id === id)).filter(Boolean);

        setSelectedAircraftTypes(selectedTypes);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleSave = () => {
    const selectedIds = selectedAircraftTypes.map(type => type.id);
    const apiEndpoint = `${SERVER_IP}/api/stands/update-stand/${standId}`;

    if (!standName || !standCode) {
      toast.error('Please fill the required fields.');
      return;
    }

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId, standName, standCode, latitude, longitude, ac_id: selectedIds,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          toast.success(data.message);
          fetchData();
          closeStandForm();
        } else {
          toast.error(data.error);
        }
      })
      .catch((error) => {
        console.log('Error updating flight:', error);
      });
  };

  const handleDelete = () => {
    fetch(`${SERVER_IP}/api/stands/delete-stand/${standId}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
      }),
    })
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            toast.success(data.message);
            fetchData();
          } else {
            toast.warning(data.message || 'Cannot delete stand.');
          }
        }))
      .catch(error => {
        toast.error('Cannot delete stand.');
      });
  };

  const handleAircraftTypeChange = (event, newValue) => {
    setSelectedAircraftTypes(newValue);
  };

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const detailArray = aircraft ? aircraft.split(',') : [];

  return (<>
    <TableRow>
      <TableCell> {standName} </TableCell>

      <TableCell> {aoccStandCode} </TableCell>

      <TableCell>
        <Label color={pbb === 1 ? 'success' : 'error'}>
          {pbb === 1 ? 'Available' : 'NA'}
        </Label>
      </TableCell>

      <TableCell>
        {detailArray.map((value, index) => (<React.Fragment key={index}>
          <Label
            key={index}
            color="info"
            sx={{ marginRight: '5px', marginBottom: '3px', marginTop: '3px' }}
          >
            {value.trim()}
          </Label>
          {index !== detailArray.length - 1 && ' '} {/* Add a space if it's not the last element */}
        </React.Fragment>))}
      </TableCell>

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

    <Dialog open={isStandFormOpen} onClose={closeStandForm} maxWidth="md">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
          Edit Stand
        </DialogTitle>
        <DialogContent>
          <Grid
            sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
            container
            spacing={3}
          >
            <Grid item xs={12} sm={8}>
              <TextField fullWidth name="standName" label="Stand Name" value={name}
                         onChange={(e) => setName(e.target.value)} inputProps={{
                maxLength: 250,
              }} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth name="standCode" label="Stand Code" value={standCode}
                         onChange={(e) => setStandCode(e.target.value)} inputProps={{
                maxLength: 250,
              }} required />
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  id="aircraft-type-select"
                  options={aircraftTypes}
                  getOptionLabel={(option) => option.name}
                  value={selectedAircraftTypes}
                  onChange={handleAircraftTypeChange}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (<TextField
                      {...params}
                      variant="outlined"
                      label="Aircraft Types *"
                      placeholder="Search Aircraft Types"
                    />)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="latitude" label="Latitude" value={latitude}
                         onChange={(e) => setLatitude(e.target.value)} inputProps={{
                maxLength: 250,
              }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="longitude" label="Longitude" value={longitude}
                         onChange={(e) => setLongitude(e.target.value)} inputProps={{
                maxLength: 250,
              }} />
            </Grid>
            <Grid item xs={12} mt={2}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                <Button variant="contained" color="inherit" onClick={handleSave}>
                  Update
                </Button>
                <Button variant="outlined" color="inherit" onClick={closeStandForm}>
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

StandsTableRow.propTypes = {
  standId: PropTypes.any,
  standName: PropTypes.any,
  aoccStandCode: PropTypes.any,
  pbb: PropTypes.any,
  aircraft: PropTypes.any,
  fetchData: PropTypes.func,
};
