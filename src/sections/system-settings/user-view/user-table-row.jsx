import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { SERVER_IP } from '../../../../config';
import { bgGradient } from '../../../theme/css';
import { useAuth } from '../../../auth-context/auth-context';

// ----------------------------------------------------------------------

export default function UserTableRow({
                                       user_id, name, email, username, phone, uRole, fetchData, handleClick,
                                     }) {

  const { user } = useAuth();

  const theme = useTheme();

  const [open, setOpen] = useState(null);

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const [usernameE, setUsername] = useState('');
  const [nameE, setName] = useState('');
  const [emailE, setEmail] = useState('');
  const [phoneE, setPhone] = useState('');
  const [designationE, setDesignation] = useState('');
  const [rolesE, setRoles] = useState([]);
  const [selectedUserRolesE, setSelectedUserRoles] = useState('');
  const [isPasswordUpdateOpen, setIsPasswordUpdateOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const closeUserForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setDesignation('');
    setSelectedUserRoles('');
    setIsUserFormOpen(false);
  };

  const handleEdit = () => {
    setOpen(null);
    setIsUserFormOpen(true);

    // Fetch aircraft types and stand data simultaneously
    Promise.all([fetch(`${SERVER_IP}/api/user-roles/get-user-roles`).then(response => response.json()), fetch(`${SERVER_IP}/api/users/get-user/${user_id}`).then(response => response.json())])
      .then(([rolesData, userData]) => {
        // Set aircraft types
        setRoles(rolesData);

        setUsername(userData.username);
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone);
        setSelectedUserRoles(userData.role_id);
        setDesignation(userData.designation);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleDeleteUser = () => {
    fetch(`${SERVER_IP}/api/users/delete-user/${user_id}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId,
      }),
    })
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            toast.success(data.message);
            fetchData();
          } else {
            toast.warning(data.error || 'Cannot delete user.');
          }
        }))
      .catch(error => {
        toast.error('Cannot delete user.');
      });
  };

  const handleSave = () => {
    const apiEndpoint = `${SERVER_IP}/api/users/update-user/${user_id}`;

    if (!usernameE || !nameE || !selectedUserRolesE) {
      toast.error('Please fill the required fields.');
      return;
    }

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId, usernameE, nameE, emailE, phoneE, role_id: selectedUserRolesE, designationE,
      }),
    })
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            closeUserForm();
            fetchData();
            toast.success(data.message);
          } else {
            toast.warning(data.message);
          }
        }))
      .catch(error => {
        console.log('Error updating user:', error);
      });
  };

  const handlePasswordUpdate = () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill the required fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    // Make API call to update the password
    fetch(`${SERVER_IP}/api/users/update-password`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId, user_id, newPassword,
      }),
    })
      .then(response => response.json())
      .then(data => {
        closePasswordUpdateForm();
        toast.success(data.message);
      })
      .catch(error => {
        console.error('Error updating password:', error);
      });
  };

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
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

  const openPasswordUpdateForm = () => {
    setIsPasswordUpdateOpen(true);
  };

  const closePasswordUpdateForm = () => {
    setIsPasswordUpdateOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (<>
    <TableRow>

      <TableCell>{name}</TableCell>

      <TableCell>{username}</TableCell>

      <TableCell>{email || '-'}</TableCell>

      <TableCell>{phone || '-'}</TableCell>

      <TableCell>{uRole}</TableCell>

      {user.role === 1 && <TableCell align="right">
        <IconButton onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton>
      </TableCell>}

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

      <MenuItem onClick={handleDeleteUser} sx={{ color: 'error.mainOrange' }}>
        <DeleteOutlineIcon sx={{ mr: 2 }} />
        Delete
      </MenuItem>
    </Popover>
    <Dialog open={isUserFormOpen} onClose={closeUserForm} maxWidth="md">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'space-between' }} mt={2} mb={2} ml={4} mr={4}>
          Edit User
          <Button variant="contained" color="inherit" onClick={openPasswordUpdateForm}
                  startIcon={<EditIcon />}>
            Update Password
          </Button>
        </DialogTitle>
        <DialogContent>
          <Grid
            sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}
            container
            spacing={3}
          >
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="nameE" label="Name" value={nameE} onChange={(e) => setName(e.target.value)}
                         inputProps={{
                           maxLength: 50,
                         }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="usernameE" label="Username" value={usernameE}
                         onChange={(e) => setUsername(e.target.value)} inputProps={{
                maxLength: 20,
              }} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="emailE"
                label="Email"
                value={emailE}
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
                name="phoneE"
                label="Contact Number"
                value={phoneE}
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
                  id="roleE"
                  label="Role"
                  value={selectedUserRolesE}
                  onChange={(e) => setSelectedUserRoles(e.target.value)}
                >
                  {rolesE.map(role => (<MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth name="designationE" label="Designation" value={designationE}
                         onChange={(e) => setDesignation(e.target.value)} inputProps={{
                maxLength: 50,
              }} />
            </Grid>
            <Grid item xs={12} mt={2}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                <Button variant="contained" color="inherit" onClick={handleSave}>
                  Update
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
    <Dialog open={isPasswordUpdateOpen} onClose={closePasswordUpdateForm}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'center' }}>Update Password</DialogTitle>
      <DialogContent>
        <Grid sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }} container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth name="newPassword" label="New Password" value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="confirmPassword" label="Confirm Password" value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
              <Button variant="contained" color="inherit" onClick={handlePasswordUpdate}>
                Update
              </Button>
              <Button variant="outlined" color="inherit" onClick={closePasswordUpdateForm}>
                Cancel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  </>);
}

UserTableRow.propTypes = {
  user_id: PropTypes.any,
  name: PropTypes.any,
  email: PropTypes.any,
  username: PropTypes.any,
  phone: PropTypes.any,
  uRole: PropTypes.any,
  handleClick: PropTypes.func,
  fetchData: PropTypes.func,
};
