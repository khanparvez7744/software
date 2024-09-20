import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// ----------------------------------------------------------------------

export default function StandsTableToolbar({ filterName, onFilterName }) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  return (<Toolbar>
    <Grid
      sx={{
        display: 'flex', p: (theme) => theme.spacing(3, 1, 3, 1),
      }}
      container
      spacing={2}
      alignItems="center"
    >
      <Grid item xs={12} sm={6}>
        <OutlinedInput
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Stand.."
          startAdornment={<InputAdornment position="start">
            <SearchIcon
              sx={{ width: 20, height: 20 }}
            />
          </InputAdornment>}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Stack direction="row" justifyContent="right" spacing={2}>
          <Button variant="contained" color="inherit">
            Daily
          </Button>
          <Button variant="contained" color="inherit">
            Weekly
          </Button>
          <Button variant="contained" color="inherit">
            Monthly
          </Button>
        </Stack>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={(date) => setFromDate(date)}
            format="D/M/YYYY"
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={(date) => setToDate(date)}
            format="D/M/YYYY"
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Stack direction="row" justifyContent="right" spacing={2}>
          <Button variant="contained" color="inherit">
            View
          </Button>
          <Button variant="contained" color="success">
            Export
          </Button>
        </Stack>
      </Grid>
    </Grid>
  </Toolbar>);
}

StandsTableToolbar.propTypes = {
  filterName: PropTypes.string, onFilterName: PropTypes.func,
};
