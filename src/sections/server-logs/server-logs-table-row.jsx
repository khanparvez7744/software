import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function ServerLogsTableRow({
                                                logTypeName, log, created_at,
                                     }) {

  return (
    <TableRow>

      <TableCell>{logTypeName}</TableCell>

      <TableCell>{log}</TableCell>

      <TableCell>{fDateTime(created_at, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

    </TableRow>
  );
}

ServerLogsTableRow.propTypes = {
  logTypeName: PropTypes.any,
  log: PropTypes.any,
  created_at: PropTypes.any,
};
