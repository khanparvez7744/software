import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import TableBody from '@mui/material/TableBody';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import TableNoData from '../table-no-data';
import { SERVER_IP } from '../../../../config';
import TableEmptyRows from '../table-empty-rows';
import Scrollbar from '../../../components/scrollbar';
import NotificationsTableRow from '../notifications-table-row';
import { emptyRows, applyFilter, getComparator } from '../utils';
import NotificationsTableHead from '../notifications-table-head';

// ----------------------------------------------------------------------

export default function NotificationsPage({ open, onClose }) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [orderBy, setOrderBy] = useState('dateTime');

  const [filterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [notifications, setNotifications] = useState([]);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/notifications/get-notifications`, {
        method: 'POST', // Specify the HTTP method as POST
        headers: {
          'Content-Type': 'application/json', // Set the content type of the request body
        },
        body: JSON.stringify({}), // If you need to send data in the request body, provide it here
      });
      const data = await response.json();
      setNotifications(data); // Set the retrieved data to the state
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      // Cleanup function to clear all data and filters when the dialog is closed
      setNotifications([]);
      setFromDate(null);
      setToDate(null);
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

  const dataFiltered = applyFilter({
    inputData: notifications,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DialogTitle variant="h4" sx={{
          display: 'flex',
          justifyContent: 'center',
        }} mt={2} mb={2}>
          Notifications
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
                    Apply Filter
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Toolbar>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table>
                <NotificationsTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleSort}
                  headLabel={[
                    { id: 'message', label: 'Message' },
                    { id: 'dateTime', label: 'Date/Time' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <NotificationsTableRow
                        key={row.id}
                        message={row.message}
                        dateTime={row.dateTime}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, notifications.length)}
                  />

                  {notFound && <TableNoData query={filterName} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            page={page}
            component="div"
            count={notifications.length}
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

NotificationsPage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};