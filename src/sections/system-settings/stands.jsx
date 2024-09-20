import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import IconButton from '@mui/material/IconButton';

import { SERVER_IP } from '../../../config';
import TableNoData from './stand-view/table-no-data';
import TableEmptyRows from './stand-view/table-empty-rows';
import StandsTableRow from './stand-view/stands-table-row';
import StandsTableHead from './stand-view/stands-table-head';
import { emptyRows, applyFilter, getComparator } from './stand-view/utils';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [invalidHeader, setInvalidHeader] = useState(false);
  const [columnFive, setColumnFive] = useState(false);
  const [bulkdata, setBulkdata] = useState([]);
  const [aircraft, setAircraft] = useState([]);

  // start group upload
  useEffect(() => {
    fetch(`${SERVER_IP}/api/aircraft/get-aircraft-types`)
      .then(response => response.json())
      .then(data => {
        console.log('aircraft', data);
        setAircraft(data);
      })
      .catch(error => {
        console.error('Error in aircraft:', error);
      });
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const replaceChooseFileText = (filename) => {
    const [nameWithoutExt, extension] = filename.split('.');
    const getFilename = nameWithoutExt.length > 6 ? `${nameWithoutExt.substring(0, 6)}...` : nameWithoutExt;
    return `${getFilename}.${extension}`;
  };

  const handleFileUpload = () => {
    const reader = new FileReader();

    reader.onload = (event) => {
      // prevent to upload blank file
      const content = event.target.result;
      if (content.trim() === '') {
        toast.error('File is empty');
        setSelectedFile(null);
        return;
      }

      const { result } = event.target;
      const lines = result.split('\n').map(line => line.trim()).filter(line => line); // Split the file content into lines and remove any empty lines
      // Assuming the first line is the header

      const header = lines[0].split(',').map(item => item.trim());

      if (header.length !== 5) {
        toast.error('File must have exactly 5 columns');
        setColumnFive(true);
        return;
      }
      setColumnFive(false);

      if (!header.every((headerName) =>
        ['Stand Name', 'Stand Code', 'Aircraft Type', 'Latitude', 'Longitude'].includes(headerName))) {
        toast.error('Invalid Header name');
        setInvalidHeader(true);
        return;
      }
      setInvalidHeader(false);

      const data = [];

      // Iterate over remaining lines (data)
      for (let i = 1; i < lines.length; i += 1) {
        const dataRow = lines[i].split(',').map(item => item.trim());
        const rowData = {};
        for (let j = 0; j < header.length; j += 1) {
          rowData[header[j]] = dataRow[j];
        }
        data.push(rowData);
      }

      if (data !== '') {
        console.log('Extracted Data:', data);
        setBulkdata(data);
        // sending data to api
        const apiEndpoint = `${SERVER_IP}/api/stands/save-stand`;

        fetch(`${apiEndpoint}`, {
          method: 'POST', headers: {
            'Content-Type': 'application/json',
          }, body: JSON.stringify({
            bulkData:bulkdata
          }),
        })
          .then((response) => response.json())
          .then((data2) => {
            if (data2.message) {
              console.log('data inserting', data2);
              toast.success(data2.message);
              fetchData();
            } else {
              toast.error(data2.error);
            }
          })
          .catch((error) => {
            console.log('Error in bulk data:', error);
          });
      }
      else {
        toast.error('Data is not available');
      }
    };

    reader.readAsText(selectedFile);
  }

  const handleFileRemove = () => {
    setSelectedFile(false);
  }
  // end group upload

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

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

  return (<Container>
    <Grid container>
      <Grid item xs={12} sm={2} md={6} lg={6} xl={8}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h5">Stands</Typography>
        </Stack>
      </Grid>
      <Grid item xs={12} sm={10} md={6} lg={6} xl={4}>
        <Stack direction="row" alignItems="right" justifyContent="space-between" mb={1}>
          <Grid container>
            <Grid item xs={12} sm={5} mb={1}>
              <Button onClick={openStandForm} variant="contained" color="inherit" startIcon={<AddIcon />}>
                New Stand
              </Button>
            </Grid>
            <Grid item xs={12} sm={7} mb={1}>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="file-input"
                multiple
                type="file"
                onChange={handleFileChange}
              />
              <Button variant="outlined" color="inherit" component="label" htmlFor="file-input">
                {selectedFile ?
                  (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{replaceChooseFileText(selectedFile.name)}</span>
                      <IconButton sx={{ padding: '0', fontSize: '1.3rem' }}
                        color="disable"
                        onClick={handleFileRemove}
                      >
                        &times;
                      </IconButton>
                    </Stack>
                  )
                  : 'Choose File'}
              </Button>
              <Button variant="contained" color="success" onClick={handleFileUpload} disabled={!selectedFile}>
                Upload
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Grid>
    </Grid>

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
              pbb={row.is_pbb}
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
  </Container>);
}
