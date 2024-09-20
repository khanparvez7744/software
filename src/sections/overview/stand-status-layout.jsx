import { toast } from 'sonner';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Zoom from '@mui/material/Zoom';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import './stand-status-layout.css';
import { SERVER_IP } from '../../../config';
import { socket } from '../../websocket/websocket';

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgb(0,0,0)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
    borderRadius: '8px',
  },
}));

export default function StandStatusLayoutCard({ selectedGate, sx, ...other }) {

  const [standDetails, setStandDetails] = useState('');

  const [stand, setStand] = useState('');

  const [standStatus, setStandStatus] = useState('');

  const [standBlocked, setStandBlocked] = useState(false);

  const [buttonStyles, setButtonStyles] = useState({
    backgroundColor: '#d0d3d426', color: '#d0d3d4',
  });

  const userId = ((JSON.parse(sessionStorage.getItem('userData'))).userId).toString();

  useEffect(() => {
    setStand(() => '');
    setStandStatus(() => '');
    setStandBlocked(() => false);
    setStandDetails(() => selectedGate);
  }, [selectedGate]);

  useEffect(() => {
    setStand(() => standDetails.standName);
    setStandStatus(() => standDetails.standStatusCode);
    if (standDetails.standStatusCode === '9') {
      setStandBlocked(() => true);
    }
  }, [standDetails]);

  useEffect(() => {
    const updateClasses = () => {
      for (let i = 1; i <= 8; i += 1) {
        const circle = document.getElementById(`C${i}-${stand}`);
        if (circle) {
          circle.className.baseVal = getCircleClass(i);
        }
      }

      const flight = document.getElementById(`F-1-${stand}`);
      if (flight) {
        flight.className.baseVal = getFlightClass();
      }
    };

    const getFlightClass = () => {
      if (standStatus === '0' || standStatus === '2' || standStatus === '4' || standStatus === '6' || standStatus === '9') {
        return 'fls-1';
      }
      if (standStatus === '1' || standStatus === '3' || standStatus === '5') {
        return 'fls-2';
      }
      return 'fls-1';
    };

    const getCircleClass = () => {
      if (standStatus === '0' || standStatus === '2') {
        return 'sls-1';
      }
      if (standStatus === '1' || standStatus === '3') {
        return 'sls-2';
      }
      if (standStatus === '4' || standStatus === '5') {
        return 'sls-3';
      }
      if (standStatus === '6' || standStatus === '9') {
        return 'sls-4';
      }
      const statusNumber = parseInt(standStatus, 16); // Convert standStatus to a number from a hexadecimal string
      if (statusNumber >= 0xE001 && statusNumber <= 0xE001B) {
        return 'sls-4';
      }
      return 'sls-1';
    };

    updateClasses();
  }, [standStatus, stand]);

  useEffect(() => {
    setButtonStyles({
      backgroundColor: standBlocked ? '#e6222226' : '#d0d3d426', color: standBlocked ? '#e62222' : '#d0d3d4',
    });
  }, [standBlocked]);

  const updateStandStatus = (newStatus) => {
    setStandStatus(() => newStatus);
    if (newStatus === '9') {
      setStandBlocked(() => true);
    } else {
      setStandBlocked(() => false);
    }
  };

  useEffect(() => {
    const handleStandStatus = (data) => {
      if (stand === data.standName) {
        updateStandStatus(data.standStatusCode);
      }
    };

    socket.on('standStatus:', handleStandStatus);

    return () => {
      socket.off('standStatus:', handleStandStatus);
    };
  }, [stand]);

  const handleStandBlocking = () => {
    const { standId } = selectedGate;
    const apiEndpoint = `${SERVER_IP}/api/stands/block-stand/${standId}`;

    fetch(`${apiEndpoint}`, {
      method: 'POST', headers: {
        'Content-Type': 'application/json',
      }, body: JSON.stringify({
        userId,
        status: standBlocked ? 0 : 1,
      }),
    })
      .then(response => response.json()
        .then(data => {
          if (response.ok) {
            toast.success(data.message);
          } else {
            toast.warning(data.error);
          }
        }))
      .catch(error => {
        toast.error(`${error}`);
      });
  };

  return (<Card
    component={Stack}
    direction="column"
    sx={{
      position: 'relative', px: 2, py: 2, borderRadius: 2, height: '250px', justifyContent: 'center',
    }}
  >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 67.78 243.39">
        <g id="line">
          <g id="centerline">
            <polygon className="mls-1" points="36.98 2 36.61 231.51 31.63 231.51 31.96 2 36.98 2 36.98 2" />
          </g>
          {Array.from({ length: 8 }).map((_, index) => (<circle
            key={index}
            id={`C${index + 1}-${stand}`}
            className="sls-1" // Initial class
            cx="34.47"
            cy={(index * 32.43) + 3.38} // Adjust the y-coordinate for each circle
            r="3.38"
          />))}
        </g>
        <g id="flight">
          <path id={`F-1-${stand}`} className="fls-1"
                d="M0,142.51l29.3-23.8s.27-16.45.7-21.92c0,0,.61-3.98,4-4.36,0,0,2.75-.29,3.98,4.29,0,0,.7,18.93.72,22.17l29.08,23.62-2.45,3.49-26.68-11.06s-.38,18.97-.66,20.08l6.31,5.18v5.27s-10.3-3.55-10.3-3.55l-10.3,3.55v-5.27l6.31-5.18s-.59-14.35-.66-20.17l-26.89,11.15-2.45-3.49Z" />
        </g>
      </svg>
    <CustomTooltip TransitionComponent={Zoom} TransitionProps={{ timeout: 200 }}
             title={standBlocked ? 'Unblock Stand' : 'Block Stand'} arrow>
      <IconButton
        onClick={handleStandBlocking}
        sx={{
          position: 'absolute', top: 1, left: 1, borderRadius: '8px', ...buttonStyles,
        }}
        size="small"
      >
        <RemoveCircleIcon fontSize="small" />
      </IconButton>
    </CustomTooltip>
  </Card>);
}

StandStatusLayoutCard.propTypes = {
  sx: PropTypes.object, selectedGate: PropTypes.any,
};