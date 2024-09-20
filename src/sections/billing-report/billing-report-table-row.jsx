import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { fDateTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function BillingReportTableRow({
                                                isWarning, flightId, flightNumber, standName, blocksOn, blocksOff, chocksOn, chocksOff, pbbOn, pbbOff, stayTime,
                                     }) {

  return (
    <TableRow>

      <TableCell component="th" scope="row">
        {isWarning === 1 && <Stack direction="row" alignItems="center" spacing={2}>
          <WarningAmberIcon color="warning" />
          <Typography variant="subtitle2" noWrap>
            {flightId}
          </Typography>
        </Stack>}
        {isWarning !== 1 && flightId
        }
      </TableCell>

      <TableCell>{standName}</TableCell>

      <TableCell>{flightNumber}</TableCell>

      <TableCell>{fDateTime(blocksOn, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

      <TableCell>{fDateTime(blocksOff, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

      <TableCell>{fDateTime(chocksOn, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

      <TableCell>{fDateTime(chocksOff, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

      <TableCell>{fDateTime(pbbOn, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

      <TableCell>{fDateTime(pbbOff, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

      <TableCell>{stayTime || '-'}</TableCell>

    </TableRow>
  );
}

BillingReportTableRow.propTypes = {
  isWarning: PropTypes.any,
  flightId: PropTypes.any,
  standName: PropTypes.any,
  flightNumber: PropTypes.any,
  blocksOn: PropTypes.any,
  blocksOff: PropTypes.any,
  chocksOn: PropTypes.any,
  chocksOff: PropTypes.any,
  pbbOn: PropTypes.any,
  pbbOff: PropTypes.any,
  stayTime: PropTypes.any,
};
