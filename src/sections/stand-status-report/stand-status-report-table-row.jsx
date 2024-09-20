import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function StandStatusReportTableRow({ standName, flightNumber, standStatus, dateTime, }) {

  return (
    <TableRow>

      <TableCell>{standName}</TableCell>

      <TableCell>{flightNumber}</TableCell>

      <TableCell>{standStatus}</TableCell>

      <TableCell>{fDateTime(dateTime, 'dd MMM yyyy HH:mm:ss')}</TableCell>

    </TableRow>
  );
}

StandStatusReportTableRow.propTypes = {
  standName: PropTypes.any,
  flightNumber: PropTypes.any,
  standStatus: PropTypes.any,
  dateTime: PropTypes.any,
};
