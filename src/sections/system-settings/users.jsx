import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import AddIcon from '@mui/icons-material/Add';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import SearchIcon from '@mui/icons-material/Search';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../config';
import TableNoData from './user-view/table-no-data';
import UsersTableRow from './user-view/user-table-row';
import UsersTableHead from './user-view/user-table-head';
import TableEmptyRows from './user-view/table-empty-rows';
import { emptyRows, applyFilter, getComparator } from './user-view/utils';

export default function Users() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [orderBy, setOrderBy] = useState('deviceId');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [users, setUsers] = useState([]);

  const [username, setUsername] = useState('');

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [phone, setPhone] = useState('');

  const [designation, setDesignation] = useState('');

  const [roles, setRoles] = useState([]);

  const [selectedUserRoles, setSelectedUserRoles] = useState('');

  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const fetchData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}/api/users/get-users`);
      const data = await response.json();
      setUsers(data); // Set the retrieved data to the state
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Call the fetchData function when the component mounts
  }, []);

  const openUserForm = () => {
    setIsAddUserFormOpen(true);
    fetch(`${SERVER_IP}/api/user-roles/get-user-roles`)
      .then(response => response.json())
      .then(data => {
        setRoles(data);
      })
      .catch(error => {
        console.error('Error fetching User Roles:', error);
      });
  };

  const closeUserForm = () => {
    setUsername('');
    setName('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setSelectedUserRoles('');
    setIsAddUserFormOpen(false);
  };

  const handleSave = () => {
    const apiEndpoint = `${SERVER_IP}/api/users/save-user`;

    if (!username || !name || !selectedUserRoles) {
      toast.error('Please fill the required fields.');
      return;
    }

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId, username, name, email, phone, role_id: selectedUserRoles, designation,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        closeUserForm();
        toast.success(data.message);
        fetchData();
      })
      .catch(error => {
        console.error('Error saving/updating user data:', error);
        if (error.message === 'HTTP error! Status: 400') {
          // Handle specific error message for username or email conflicts
          toast.error('Username or email already in use.');
        } else {
          toast.error('Error saving/updating user data. Please try again later.');
        }
      });
  };

  const isEmailValid = (inputEmail) => {
    if (!inputEmail) {
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  const isPhoneValid = (phoneNumber) => {
    if (!phoneNumber) {
      return true;
    }

    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
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
    inputData: users, comparator: getComparator(order, orderBy), filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (<Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h5">Users</Typography>
        <Button onClick={openUserForm} variant="contained" color="inherit" startIcon={<AddIcon />}>
          New User
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
              placeholder="Search User.."
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
          <UsersTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleSort}
            headLabel={[{ id: 'name', label: 'Name' }, { id: 'username', label: 'Username' }, {
              id: 'email',
              label: 'Email',
            }, { id: 'phone', label: 'Contact Number' }, { id: 'uRole', label: 'Role' }, { id: '' }]}
          />
          <TableBody>
            {dataFiltered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (<UsersTableRow
                  key={row.user_id}
                  user_id={row.user_id}
                  name={row.name}
                  email={row.email}
                  username={row.username}
                  phone={row.phone}
                  uRole={row.uRole}
                  fetchData={fetchData}
                />))}

            <TableEmptyRows
              height={77}
              emptyRows={emptyRows(page, rowsPerPage, users.length)}
            />

            {notFound && <TableNoData query={filterName} />}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        page={page}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={isAddUserFormOpen} onClose={closeUserForm} maxWidth="md">
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
            Add User
          </DialogTitle>
          <DialogContent>
            <Grid
              sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
              container
              spacing={3}
            >
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="name" label="Name" value={name} onChange={(e) => setName(e.target.value)}
                           inputProps={{
                             maxLength: 50,
                           }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="username" label="Username" value={username}
                           onChange={(e) => setUsername(e.target.value)} inputProps={{
                  maxLength: 20,
                }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!isEmailValid(email)}
                  helperText={!isEmailValid(email) ? 'Invalid email format' : ''}
                  inputProps={{
                    maxLength: 50,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Contact Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={!isPhoneValid(phone)}
                  helperText={!isPhoneValid(phone) ? 'Invalid format - Requires 10 Digit Number' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    label="Role"
                    value={selectedUserRoles}
                    onChange={(e) => setSelectedUserRoles(e.target.value)}
                  >
                    {roles.map(role => (<MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth name="designation" label="Designation" value={designation}
                           onChange={(e) => setDesignation(e.target.value)} inputProps={{
                  maxLength: 50,
                }} />
              </Grid>
              <Grid item xs={12} alignItems="center">
                <Stack direction="row" alignItems="center" justifyContent="center">
                  <Typography variant="caption" color="inherit">
                    Set/Update password after the user is saved.
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} mt={2}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                  <Button variant="contained" color="inherit" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="outlined" color="inherit" onClick={closeUserForm}>
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