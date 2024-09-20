import { toast } from 'sonner';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';

import { SERVER_IP } from '../../../config';

// ----------------------------------------------------------------------

export default function BlockingTableRow({ key, standName, standId }) {
  const apiEndpoint = `${SERVER_IP}/api/stands/block-stand/${standId}`;
  const uId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  const handleUnblock = async () => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 0,
          userId: uId,
        }),
      });
      console.log('helo', response);

      const data = await response.json();

      if (data.message) {
        toast.success(data.message);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error updating stand:', error);
    }
  };

  return (
    <TableRow key={key}>
      <TableCell>{standName || '-'}</TableCell>
      <TableCell>
        <Button variant="contained" color="inherit" onClick={handleUnblock}>
          Unblock
        </Button>
      </TableCell>
    </TableRow>
  );
}

BlockingTableRow.propTypes = {
  key: PropTypes.any,
  standName: PropTypes.any,
  standId: PropTypes.any,
};