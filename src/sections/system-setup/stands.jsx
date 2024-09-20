import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../config';
import { useAuth } from '../../auth-context/auth-context';
import TableNoData from '../system-settings/stand-view/table-no-data';
import StandsTableRow from '../system-settings/stand-view/stands-table-row';
import TableEmptyRows from '../system-settings/stand-view/table-empty-rows';
import StandsTableHead from '../system-settings/stand-view/stands-table-head';
import { emptyRows, applyFilter, getComparator } from '../system-settings/stand-view/utils';

export default function Stands() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');

  const [orderBy, setOrderBy] = useState('standName');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [stands, setStands] = useState([]);

  const [isAddStandFormOpen, setIsAddStandFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [standCode, setStandCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [selectedAircraftTypes, setSelectedAircraftTypes] = useState([]);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const navigate = useNavigate();

  const { saveConfiguration } = useAuth();

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/stands/get-stands`);
      const data = await response.json();
      setStands(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openStandForm = () => {
    setIsAddStandFormOpen(true);

    fetch(`${SERVER_IP}/api/aircraft/get-aircraft-types`)
      .then(response => response.json())
      .then(data => {
        setAircraftTypes(data);
      })
      .catch(error => {
        console.error('Error fetching User Roles:', error);
      });
  };

  const closeStandForm = () => {
    setName('');
    setStandCode('');
    setLongitude('');
    setLatitude('');
    setSelectedAircraftTypes([]);
    setIsAddStandFormOpen(false);
  };

  const handleAircraftTypeChange = (event, newValue) => {
    setSelectedAircraftTypes(newValue);
  };

  const handleSave = () => {
    const selectedIds = selectedAircraftTypes.map(type => type.id);
    const apiEndpoint = `${SERVER_IP}/api/stands/save-stand`;

    if (!name || !standCode) {
      toast.error('Please fill the required fields.');
      return;
    }

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId, standName: name, standCode, latitude, longitude, ac_id: selectedIds,
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
    inputData: stands, comparator: getComparator(order, orderBy), filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleFinish = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/config/get-application-settings`);
      const data = await response.json();
      saveConfiguration(data);
      navigate('/dashboard', { replace: true });
      toast.success('Application setup successfully.');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={6} mb={1}>
        <Typography variant="h5">Stands</Typography>
        <Button onClick={openStandForm} variant="contained" color="inherit" startIcon={<AddIcon />}>
          New Stand
        </Button>
      </Stack>
      <Toolbar sx={{ paddingLeft: '0px !important', paddingRight: '0px !important' }}>
        <Grid
          sx={{
            display: 'flex', p: (theme) => theme.spacing(3, 0, 3, 0),
          }}
          container
          alignItems="center"
        >
          <Grid item xs={12} sm={6}>
            <OutlinedInput
              fullWidth
              value={filterName}
              onChange={handleFilterByName}
              placeholder="Search Stand.."
              startAdornment={<InputAdornment position="start">
                <SearchIcon
                  sx={{ width: 20, height: 20 }}
                />
              </InputAdornment>}
            />
          </Grid>
        </Grid>
      </Toolbar>
      <TableContainer sx={{ overflow: 'unset', marginBottom: '5px' }}>
        <Table size="small">
          <StandsTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleSort}
            headLabel={[{ id: 'standName', label: 'Stand Name' }, {
              id: 'aoccStandCode',
              label: 'AOCC Code',
            }, { id: 'pbb', label: 'PBB' }, { id: 'aircrafts', label: 'Aircraft Type' }, { id: '' }]}
          />
          <TableBody>
            {dataFiltered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (<StandsTableRow
                key={row.id}
                standId={row.id}
                standName={row.name}
                aoccStandCode={row.aocc_code}
                pbb={row.pbb}
                aircraft={row.aircraft_names}
                fetchData={fetchData}
              />))}

            <TableEmptyRows
              height={77}
              emptyRows={emptyRows(page, rowsPerPage, stands.length)}
            />

            {notFound && <TableNoData query={filterName} />}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        page={page}
        component="div"
        count={stands.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={isAddStandFormOpen} onClose={closeStandForm} maxWidth="md">
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
            Add Stand
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
                    Save
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
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{
        p: 5,
      }}>
        <Button variant="contained" color="success" onClick={handleFinish}>
          Finish
          <CheckCircleOutlineIcon sx={{ ml: 1 }} />
        </Button>
      </Stack>
    </Container>
  );
}

Stands.propTypes = {

};