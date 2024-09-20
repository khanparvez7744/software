import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import TableBody from '@mui/material/TableBody';
import DialogTitle from '@mui/material/DialogTitle';
import SearchIcon from '@mui/icons-material/Search';
import DialogContent from '@mui/material/DialogContent';
import OutlinedInput from '@mui/material/OutlinedInput';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import TableNoData from '../table-no-data';
import { SERVER_IP } from '../../../../config';
import TableEmptyRows from '../table-empty-rows';
import FlightsTableRow from '../flights-table-row';
import FlightsTableHead from '../flights-table-head';
import Scrollbar from '../../../components/scrollbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function FlightsPage({ open, onClose }) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [orderBy, setOrderBy] = useState('time');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [flights, setFlights] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/flights/get-flights`);
      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      // Cleanup function to clear all data and filters when the dialog is closed
      setFlights([]);
      setFilterName('');
      setPage(0);
      setRowsPerPage(5);
      setOrder('desc');
      setOrderBy('dateTime');
    }
  }, [open]);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: flights,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DialogTitle variant="h4" sx={{
          display: 'flex',
          justifyContent: 'center',
        }} mt={2} mb={2}>
          Flights
        </DialogTitle>
        <DialogContent>
          <Toolbar sx={{ paddingLeft: '0px !important', paddingRight: '0px !important' }}>
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
                  onChange={handleFilterByName}
                  placeholder="Search Flight Id.."
                  startAdornment={<InputAdornment position="start">
                    <SearchIcon
                      sx={{ width: 20, height: 20 }}
                    />
                  </InputAdornment>}
                />
              </Grid>
            </Grid>
          </Toolbar>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table>
                <FlightsTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleSort}
                  headLabel={[
                    { id: 'flightId', label: 'Flight Id' },
                    { id: 'standName', label: 'Stand' },
                    { id: 'flightNumber', label: 'Flight Number' },
                    { id: 'flightStatus', label: 'Flight Status' },
                    { id: 'scheduleTime', label: 'Schedule Time' },
                    { id: 'estimatedTime', label: 'Estimated Time' },
                    { id: ''}
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <FlightsTableRow
                        key={row.flightId}
                        flightId={row.flightId}
                        standName={row.standName}
                        flightNumber={row.flightNumber}
                        flightStatus={row.flightStatus}
                        scheduleTime={row.time}
                        estimatedTime={row.estimatedTime}
                        fetchData={fetchData}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, flights.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            page={page}
            component="div"
            count={flights.length}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DialogContent>
      </LocalizationProvider>
    </Dialog>
  );
}

FlightsPage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
