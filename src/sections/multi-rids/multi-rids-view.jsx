import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import Rids from './rids';
import { SERVER_IP } from '../../../config';

const RidsComponent = () => {
  const [devices, setDevices] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${SERVER_IP}/api/devices/get-rids-devices`);
        const data = await response.json();
        if (data.length <= 4) {
          setItemsPerPage(4);
        } else if (data.length > 4 && data.length <= 8) {
          setItemsPerPage(8);
        } else if (data.length > 8) {
          setItemsPerPage(12);
        }
        setDevices(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setPage(1); // Reset to first page on items per page change
  };

  let itemsPerPageOptions = [];
  if (devices.length >= 12) {
    itemsPerPageOptions = [4, 8, 12];
  } else if (devices.length > 4 && devices.length <= 8) {
    itemsPerPageOptions = [4, 8];
  } else if (devices.length <= 4) {
    itemsPerPageOptions = [4];
  }

  // Calculate paginated devices based on current page and items per page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, devices.length);
  const paginatedDevices = devices.slice(startIndex, endIndex);

  return (<>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4, mb: 1, px: 6 }}>
        <Typography variant="h4">RIDS</Typography>
      </Stack>
      <Grid container spacing={2} sx={{ mt: 0, mb: 1, px: 6 }}>
        {paginatedDevices.map((device, index) => (<Grid item xs={12} sm={6} md={4} lg={3} key={device.svdgs_id}>
            <Stack sx={{ mt: 0, mx: 1, mb: 0.3 }}>
              <Typography variant="body2">Stand-{device.standName} RIDS</Typography>
            </Stack>
            <Card component={Stack}
                  spacing={2}
                  sx={{
                    px: 2, py: 2, borderRadius: 2, height: '250px', alignItems: 'center',
                  }}>
              <Rids ridsDevice={device} />
            </Card>
          </Grid>))}
      </Grid>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ mt: 1 }}>
        <Pagination count={Math.ceil(devices.length / itemsPerPage)} page={page} onChange={handlePageChange} />
        <FormControl sx={{ minWidth: '9%' }}>
          <InputLabel>Items per page</InputLabel>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            label="Items per page"
          >
            {itemsPerPageOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
          </Select>
        </FormControl>
      </Stack>
    </>);
};

export default RidsComponent;