import { toast } from 'sonner';
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
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { SERVER_IP } from '../../../../config';
import TableNoData from '../table-no-data';
import TableEmptyRows from '../table-empty-rows';
import Scrollbar from '../../../components/scrollbar';
import BlockingTableRow from '../blocking-table-row';
import BlockingTableHead from '../blocking-table-head';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function BlockingPage({ open, onClose }) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('standName');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [stand, setStand] = useState([]);

  const [unblockstand, setUnblockstand] = useState([]);

  const [blockingData, setBlockingData] = useState([]);

  const [standName, setStandName] = useState('');

  const [status, setStatus] = useState('');
  const [selectedStand, setSelectedStand] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);

  const getStandName = () => {
    fetch(`${SERVER_IP}/api/stands/get-stands`)
      .then(response => response.json())
      .then(data => {
        const unblockStand = data.filter(item => item.status === 1);
        setUnblockstand(unblockStand);
      })
      .catch(error => {
        console.error('Error fetching stands:', error);
      });
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/stands/get-blocked-stands`);
      const data = await response.json();
      setBlockingData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    getStandName();
    fetchData();
  }, [unblockstand]);

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
    inputData: blockingData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const doBlock = () => {
    const get_userid = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();
    // const get_userid = sessionStorage.getItem('userId');
    console.log('get_userid', get_userid);
    const get_stand_ids = selectedValues.map((item2) => {
      return item2.id;
    });
    console.log('get_stand_ids', get_stand_ids);
    const apiEndpoint = `${SERVER_IP}/api/stands/multi-stand-block`;
    fetch(`${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stand_ids: get_stand_ids,
        status: '1',
        userId: get_userid
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          console.log('data updated');
          toast.success(data.message);
          onClose();
        }
        else {
          console.log('data not updated');
          toast.error(data.error);
        }
      })
      .catch(error => {
        console.log('Error updating stand:', error);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle variant="h4" sx={{
        display: 'flex',
        justifyContent: 'center',
      }} mt={2} mb={2}>
        Stand Blocking System
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
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  id="stand-select"
                  options={unblockstand}
                  getOptionLabel={(option) => option.name}
                  value={selectedValues} // Bind selectedValues state
                  onChange={(event, newValue) => setSelectedValues(newValue)}
                  renderInput={(params) =>
                  (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Stand Name *"
                      placeholder="Search Stand Names"
                    />
                  )
                  }
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" justifyContent="left">
                <Button variant="contained" color="inherit" onClick={doBlock}>
                  Block
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table>
              <BlockingTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleSort}
                headLabel={[
                  { id: 'standName', label: 'Stand Name' },
                  { id: 'status', label: 'Status' }
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <BlockingTableRow
                      key={row.id}
                      standName={row.name}
                      standId={row.id}
                    />
                  ))}
                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, blockingData.length)}
                />
                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          page={page}
          component="div"
          count={blockingData.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DialogContent>
    </Dialog>
  );
}

BlockingPage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};