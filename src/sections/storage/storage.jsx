import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import FileManager from './file-manager'; // Import the FileManager component

export default function Storage({ open, onClose }) {

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <DialogTitle variant="h4" sx={{ display: 'flex', justifyContent: 'center' }} mt={2} mb={2}>
          Storage
        </DialogTitle>
        <DialogContent>
          <FileManager initialPath="./" />
        </DialogContent>
      </LocalizationProvider>
    </Dialog>
  );
}

Storage.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};