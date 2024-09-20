import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../../config';
import TableEmptyRows from '../table-empty-rows';
import Scrollbar from '../../../components/scrollbar';
import ServerLogsTableRow from '../server-logs-table-row';
import ServerLogsTableHead from '../server-logs-table-head';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function ServerLogsPage({ open, onClose }) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [orderBy, setOrderBy] = useState('dateTime');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [logTypes, setLogTypes] = useState([]);

  const [serverLogsData, setServerLogsData] = useState([]);

  const [selectedLogTypes, setSelectedLogTypes] = useState([]);

  const [fromDate, setFromDate] = useState(null);

  const [toDate, setToDate] = useState(null);

  const formatAndAdjustTimezone = (date) => {
    if (!date) return null; // Return empty string if date is empty

    const utcDate = new Date(date);
    const nextDay = new Date(utcDate);
    nextDay.setHours(24, 0, 0, 0);  // Set hours, minutes, seconds, and milliseconds to 0
    return nextDay.toISOString().slice(0, 10);  // Format as 'YYYY-MM-DD'
  };

  const fetchData = () => {

    const formattedFromDate = formatAndAdjustTimezone(fromDate);
    const formattedToDate = formatAndAdjustTimezone(toDate);

    const isAllSelected = selectedLogTypes && selectedLogTypes.includes('All');
    const logTypeName = isAllSelected ? null : selectedLogTypes;

    const requestBody = {
      logTypeName,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
    };

    fetch(`${SERVER_IP}/api/server-logs/get-server-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setPage(0);
        setServerLogsData(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  useEffect(() => {
    if (open) {
      fetch(`${SERVER_IP}/api/server-logs/get-log-types`)
        .then(response => response.json())
        .then(data => {

          setLogTypes(data);
        })
        .catch(error => {
          console.error('Error fetching nodes:', error);
        });

    } else {
      // Cleanup function to clear all data and filters when the dialog is closed
      setSelectedLogTypes([]);
      setServerLogsData([]);
      handleClearAll();
    }
  }, [open]);

  const handleClearAll = () => {
    setFromDate(null);
    setToDate(null);
    setPage(0);
    setRowsPerPage(5);
    setOrder('desc');
    setOrderBy('dateTime');
    setSelectedLogTypes([]);
    setServerLogsData([]);

  };

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
    inputData: serverLogsData,
    comparator: getComparator(order, orderBy),
  });

  // const notFound = selectedLogTypes.length > 0 && serverLogsData.length === 0;

  const showClearFiltersButton = selectedLogTypes.length > 0 || fromDate || toDate;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DialogTitle variant="h4" sx={{
          display: 'flex',
          justifyContent: 'center',
        }} mt={2} mb={2}>
          Server Logs
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="log_tyoe">Log Type</InputLabel>
                  <Select
                    labelId="log_tyoe"
                    id="log_tyoe"
                    label="Log Type"
                    multiple
                    value={selectedLogTypes}
                    onChange={(e) => setSelectedLogTypes(e.target.value)}
                    renderValue={(selectedItems) => selectedItems.join(', ')}
                  >
                    <MenuItem value="All">
                      <Checkbox color="default" checked={selectedLogTypes.includes('All')} />
                      All
                    </MenuItem>
                    {logTypes.map(logType => (
                      <MenuItem key={logType.id} value={logType.name}>
                        <Checkbox color="default" checked={selectedLogTypes.includes(logType.name)} />
                        {logType.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} />
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <DatePicker
                    label="From Date"
                    value={fromDate}
                    onChange={(date) => setFromDate(date)}
                    format="D/M/YYYY"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <DatePicker
                    label="To Date"
                    value={toDate}
                    onChange={(date) => setToDate(date)}
                    format="D/M/YYYY"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" justifyContent="right" spacing={2}>
                  {showClearFiltersButton && (
                    <Button variant="text" color="inherit" onClick={handleClearAll}>
                      Clear Filters
                    </Button>
                  )}
                  <Button variant="contained" color="inherit" onClick={fetchData} >
                    Apply Filters
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Toolbar>
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table>
                <ServerLogsTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleSort}
                  headLabel={[
                    { id: 'logTypeName', label: 'Log Type' },
                    { id: 'log', label: 'Log' },
                    { id: 'created_at', label: 'Date Time' },
                  ]}
                />
                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <ServerLogsTableRow
                        key={row.id}
                        logTypeName={row.logTypeName}
                        log={row.log}
                        created_at={row.created_at}
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, serverLogsData.length)}
                  />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <TablePagination
            page={page}
            component="div"
            count={serverLogsData.length}
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

ServerLogsPage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
