import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function DockingEventLogTableRow({
                                               flightId, flightNumber, log, dateTime,
                                     }) {

  return (
    <TableRow>

      <TableCell>{flightId}</TableCell>

      <TableCell>{flightNumber}</TableCell>

      <TableCell>{log}</TableCell>

      <TableCell>{fDateTime(dateTime, 'dd MMM yyyy HH:mm:ss')}</TableCell>

    </TableRow>
  );
}

DockingEventLogTableRow.propTypes = {
  flightId: PropTypes.any,
  flightNumber: PropTypes.any,
  log: PropTypes.any,
  dateTime: PropTypes.any,
};
