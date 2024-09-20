import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from '../../utils/format-time';

// ----------------------------------------------------------------------

export default function SensorReportTableRow({
                                               standName, deviceId, cpuTemp, gpuTemp, lidarTemp, chamberTemp, chamberHumid, fanStatus, dateTime
                                     }) {

  return (
    <TableRow>

      <TableCell>{standName}</TableCell>

      <TableCell>{deviceId}</TableCell>

      <TableCell>{cpuTemp !== null && cpuTemp !== '0' ? `${cpuTemp} °C` : '-'}</TableCell>

      <TableCell>{gpuTemp !== null && gpuTemp !== '0' ? `${gpuTemp} °C` : '-'}</TableCell>

      <TableCell>{lidarTemp !== null && lidarTemp !== '0' ? `${lidarTemp} °C` : '-'}</TableCell>

      <TableCell>{chamberTemp !== null && chamberTemp !== '0' ? `${chamberTemp} °C` : '-'}</TableCell>

      <TableCell>{chamberHumid !== null ? `${chamberHumid} %` : '-'}</TableCell>

      <TableCell>{fanStatus === 1 ? 'ON' : 'OFF'}</TableCell>

      <TableCell>{fDateTime(dateTime, 'dd MMM yyyy HH:mm:ss') || '-'}</TableCell>

    </TableRow>
  );
}

SensorReportTableRow.propTypes = {
  standName: PropTypes.any,
  deviceId: PropTypes.any,
  cpuTemp: PropTypes.any,
  gpuTemp: PropTypes.any,
  lidarTemp: PropTypes.any,
  chamberTemp: PropTypes.any,
  chamberHumid: PropTypes.any,
  fanStatus: PropTypes.any,
  dateTime: PropTypes.any,
};
