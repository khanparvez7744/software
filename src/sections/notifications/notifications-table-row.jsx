import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function NotificationsTableRow({
                                               message, dateTime,
                                     }) {

  return (
    <TableRow>

      <TableCell>{message}</TableCell>

      <TableCell>{fDateTime(dateTime, 'dd MMM yyyy HH:mm:ss')}</TableCell>

    </TableRow>
  );
}

NotificationsTableRow.propTypes = {
  message: PropTypes.any,
  dateTime: PropTypes.any,
};
