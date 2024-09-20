import PropTypes from 'prop-types';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import './rids.css';
import { socket, ridsSocket } from '../../websocket/websocket';
import backgroundImage from '../../assets/images/rids/kolkata.png';

const Rids = ({ ridsDevice }) => {

  const [standDetails, setStandDetails] = useState('');
  const [standName, setStandName] = useState('');
  const [device, setDevice] = useState('');
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [airportCode, setAirportCode] = useState(true);
  const [airportCodeValue, setAirportCodeValue] = useState('');

  const [standbyScreen, setStandbyScreen] = useState(false);
  const [fullDate, setFullDate] = useState('');
  const [fullTime, setFullTime] = useState('');

  const [waitScreen, setWaitScreen] = useState(false);

  const [idFailScreen, setIdFailScreen] = useState(false);

  const [dockingScreen, setDockingScreen] = useState(false);
  const [aircraft, setAircraftType] = useState('');
  const [distance, setDistance] = useState(100);
  const [flightDetect, setFlightDetect] = useState(0);
  const [xPosition, setXPosition] = useState(33);
  const [rightArrow, setRightArrow] = useState(false);
  const [leftArrow, setLeftArrow] = useState(false);

  const [slowScreen, setSlowScreen] = useState(false);
  const [stopScreen, setStopScreen] = useState(false);
  const [tooFarScreen, setTooFarScreen] = useState(false);
  const [okScreen, setOkScreen] = useState(false);
  const [parkedScreen, setParkedScreen] = useState(false);

  const [billingScreen, setBillingScreen] = useState(false);
  const [time, setTime] = useState('');
  const [chkValue, setCHKValue] = useState('OFF');
  const [pbbValue, setPBBValue] = useState('OFF');
  const [gpuValue, setGPUValue] = useState('OFF');
  const [pcaValue, setPCAValue] = useState('OFF');

  const [errorScreen, setErrorScreen] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  const [disconnectScreen, setDisconnectScreen] = useState(true);

  const slowTimerRef = useRef(null);

  const updateFlightDetect = useCallback((newDistance) => {
    const distanceValue = parseFloat(newDistance);
    if (distanceValue > 0.0) {
      setFlightDetect(() => 1);
      setDistance(() => distanceValue.toFixed(1));
    } else {
      setFlightDetect(() => 0);
    }
  }, []);

  const setAllScreensFalse = useCallback(() => {
    setDisconnectScreen(() => false);
    setStandbyScreen(() => false);
    setWaitScreen(() => false);
    setIdFailScreen(() => false);
    setDockingScreen(() => false);
    setStopScreen(() => false);
    setTooFarScreen(() => false);
    setOkScreen(() => false);
    setParkedScreen(() => false);
    setBillingScreen(() => false);
    setErrorScreen(() => false);
  }, []);

  const handleStandStatus = useCallback((data) => {
    if (standName === data.standName) {
      if (data.standStatusCode === '4') {
        setAllScreensFalse();
        setWaitScreen(() => true);
      }
    }
  }, [setAllScreensFalse, standName]);

  const handleDeviceStatus = useCallback((data) => {
    if (device === data.deviceId) {
      setDeviceStatus(() => data.deviceStatus);
    }
  }, [device]);

  const handleRids = useCallback((data) => {
    if (standName === data.rids.stand) {
      // Clear previous values before setting new ones
      setAircraftType(() => data.rids.aircraftType);

      if (data.rids.wait === '1') {
        setAllScreensFalse();
        setWaitScreen(() => true);
      } else if (data.rids.dockActive === '1') {
        setAllScreensFalse();
        setDockingScreen(() => true);
        updateFlightDetect(data.rids.range);
        setXPosition(() => parseInt(data.rids.flightX, 10));
        setRightArrow(() => data.rids.rightArrow === '1');
        setLeftArrow(() => data.rids.leftArrow === '1');

        if (data.rids.stop === '1') {
          setAllScreensFalse();
          setStopScreen(() => true);
        }
        if (data.rids.slow === '1') {
          if (slowTimerRef.current) {
            clearTimeout(slowTimerRef.current);
          }
          setSlowScreen(() => true);
          slowTimerRef.current = setTimeout(() => {
            setSlowScreen(() => false);
          }, 1000);
        }
        if (data.rids.idFail === '1') {
          setAllScreensFalse();
          setIdFailScreen(() => true);
        }
      }
      if (data.rids.stop === '1') {
        setAllScreensFalse();
        setStopScreen(() => true);
      }
      if (data.rids.tooFar === '1') {
        setAllScreensFalse();
        setTooFarScreen(() => true);
      }
      if (data.rids.ok === '1') {
        setAllScreensFalse();
        setOkScreen(() => true);
      }
      if (data.rids.parked === '1') {
        setAllScreensFalse();
        setParkedScreen(() => true);
        setTimeout(() => {
          setParkedScreen(() => false);
          setBillingScreen(() => true);
        }, 2500);
      }
      if (data.rids.errorCode !== '0') {
        setAllScreensFalse();
        setErrorScreen(() => true);
        setErrorCode(() => data.rids.errorCode);
      }
      if (data.rids.departed === '1') {
        ridsSocket.off('Rids:', handleRids);
        ridsSocket.on('Rids:', handleRids);

        setAllScreensFalse();
        setStandbyScreen(() => true);
      }
      if (data.rids.chk === '1') {
        setCHKValue(() => 'ON');
        if (!billingScreen && !parkedScreen) {
          setAllScreensFalse();
          setBillingScreen(() => true);
        }
      } else {
        setCHKValue(() => 'OFF');
      }

      if (data.rids.pbb === '1') {
        setPBBValue(() => 'ON');
        if (!billingScreen && !parkedScreen) {
          setAllScreensFalse();
          setBillingScreen(() => true);
        }
      } else {
        setPBBValue(() => 'OFF');
      }

      setGPUValue(() => data.rids.gpu === '1' ? 'ON' : 'OFF');
      setPCAValue(() => data.rids.pca === '1' ? 'ON' : 'OFF');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standName]);

  const setupSockets = useCallback(() => {
    // Remove existing listeners
    socket.off('standStatus:', handleStandStatus);
    socket.off('deviceStatus:', handleDeviceStatus);
    ridsSocket.off('Rids:', handleRids);

    // Add new listeners
    socket.on('standStatus:', handleStandStatus);
    socket.on('deviceStatus:', handleDeviceStatus);
    ridsSocket.on('Rids:', handleRids);

    // Cleanup
    return () => {
      socket.off('standStatus:', handleStandStatus);
      socket.off('deviceStatus:', handleDeviceStatus);
      ridsSocket.off('Rids:', handleRids);
    };
  }, [handleStandStatus, handleDeviceStatus, handleRids]);

  useEffect(() => {
    setStandName(() => standDetails.standName);
    setAirportCodeValue(() => standDetails.airportCode);
    setDevice(() => standDetails.svdgsId);
    setDeviceStatus(() => standDetails.deviceStatus);

    const cleanupSockets = setupSockets();

    return cleanupSockets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standDetails, setupSockets]);

  useEffect(() => {
    setAllScreensFalse();
    setStandName(() => '');
    setAirportCodeValue(() => '');
    setDevice(() => '');
    setDeviceStatus(() => null);
    setDisconnectScreen(() => true);
    setStandDetails(() => ridsDevice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ridsDevice]);

  useEffect(() => {
    if (deviceStatus === 0) {
      setAllScreensFalse();
      setDisconnectScreen(() => true);
    } else if (deviceStatus === 1 && disconnectScreen) {
      setAllScreensFalse();
      setStandbyScreen(() => true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceStatus]);

  // Switching between Airport Code and Stand Name
  useEffect(() => {
    const interval = setInterval(() => {
      setAirportCode((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date();
      const year = String(currentDate.getFullYear()).slice(-2);
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      setTime(() => `${hours}:${minutes}`);
      setFullTime(() => `${hours}:${minutes}:${seconds} `);
      setFullDate(() => `${day}/${month}/${year} `);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderDisconnectScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="errorText" color="red">
      COMM
    </Typography>
    <Typography variant="errorText" color="red">
      ERROR
    </Typography>
    <Stack alignItems="center" sx={{ marginTop: '15px' }}>
      <PowerOffIcon sx={{ color: 'red', height: '35px', width: '35px' }} />
    </Stack>
  </Box>);

  const renderErrorScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="errorText" color="red">
      STOP
    </Typography>
    <Typography variant="errorText" color="red">
      ERROR
    </Typography>
    <Typography variant="errorText" color="red">
      {errorCode}
    </Typography>
  </Box>);

  const renderBillingScreen = () => (<Stack direction="column" alignItems="center" sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="billingTimeText" color="#9fff00">TIME</Typography>
    <Typography variant="billingTimeText" color="#9fff00">{time}</Typography>
    <Stack direction="row" alignItems="center">
      <Stack direction="column" alignItems="center">
        <Typography variant="billingValueText" color="#fba401">CHK</Typography>
        <Typography variant="billingValueText" color="#fba401">PBB</Typography>
        <Typography variant="billingValueText" color="#fba401">GPU</Typography>
        <Typography variant="billingValueText" color="#fba401">PCA</Typography>
      </Stack>
      <Stack direction="column" alignItems="center">
        <Typography variant="billingValueText" color={chkValue === 'ON' ? '#23d517' : 'red'}>{chkValue}</Typography>
        <Typography variant="billingValueText" color={pbbValue === 'ON' ? '#23d517' : 'red'}>{pbbValue}</Typography>
        <Typography variant="billingValueText" color={gpuValue === 'ON' ? '#23d517' : 'red'}>{gpuValue}</Typography>
        <Typography variant="billingValueText" color={pcaValue === 'ON' ? '#23d517' : 'red'}>{pcaValue}</Typography>
      </Stack>
    </Stack>
  </Stack>);

  const renderParkedScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="okParkedText" color="#23d517">PARKED</Typography>
    <Box sx={{
      height: '5px', width: '75px', background: '#6dfd00', margin: 'auto',
    }} />
    <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
  </Box>);

  const renderOkScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="okParkedText" color="#23d517">OK</Typography>
    <Box sx={{
      height: '5px', width: '75px', background: '#6dfd00', margin: 'auto',
    }} />
    <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
  </Box>);

  const renderTooFarScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Stack direction="column" alignItems="center">
      <Typography variant="tooFarText" color="#fba401">TOO</Typography>
      <Typography variant="tooFarText" color="#fba401">FAR</Typography>
    </Stack>
    <Box sx={{
      height: '5px', width: '75px', background: '#6dfd00', margin: 'auto',
    }} />
    <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
  </Box>);

  const renderStopScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="waitStopText" color="red">STOP</Typography>
    <Box sx={{
      height: '5px', width: '75px', background: '#6dfd00', margin: 'auto',
    }} />
    <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
  </Box>);


  const renderRidsAnimation = () => {
    if (distance > 25.0) {
      return (<Stack>
        <Box sx={{
          height: '90px', margin: 'auto',
        }}>
          <KeyboardDoubleArrowUpIcon sx={{
            color: '#6dfd00',
            position: 'relative',
            animationName: 'rids',
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationDirection: 'reverse',
            animationTimingFunction: 'linear',
          }} />
        </Box>
        <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
      </Stack>);
    }
    if (distance <= 25.0 && distance >= 15.0) {
      const heightRIDS = 90;
      return (<Stack>
        <Box sx={{
          height: `${heightRIDS}px`, margin: 'auto', width: '6px', background: '#6dfd00',
        }} />
        <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
      </Stack>);
    }
    if (distance < 15.0 && distance >= 0.0) {
      const heightRIDS = distance * 6;
      return (<Stack>
        <Box sx={{
          height: `${heightRIDS}px`, margin: 'auto', width: '6px', background: '#6dfd00',
        }} />
        <AirplanemodeActiveIcon sx={{ marginLeft: `${xPosition}px`, height: '30px', width: '30px' }} />
      </Stack>);
    }
    return null;
  };

  const renderDistanceInfo = () => {
    if (flightDetect === 1) {
      return `${distance} m`;
    }
    return <Typography variant="distanceNoText" />;
  };

  const renderArrow = () => {
    if (rightArrow) {
      return <ArrowRightIcon color="error" sx={{
        width: '60px', height: '60px', marginTop: '100px', position: 'absolute', marginLeft: '-25px',
      }} />;
    }
    if (leftArrow) {
      return <ArrowLeftIcon color="error" sx={{
        width: '60px', height: '60px', marginTop: '100px', position: 'absolute', marginLeft: '60px',
      }} />;
    }
    return null;
  };

  const renderDockingScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    {renderArrow()}
    {slowScreen ? <Typography variant="aircraftSlowText" color="red">SLOW</Typography> :
      <Typography variant="aircraftSlowText" color="#fba401">{aircraft}</Typography>}
    <Typography variant="distanceText" color="#f59542">{renderDistanceInfo()}</Typography>
    <Box sx={{
      height: '5px', width: '75px', background: '#6dfd00', margin: 'auto',
    }} />
    {renderRidsAnimation()}
  </Box>);

  const renderIdFailScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="idFailText" color="red">ID FAIL</Typography>
    <Box sx={{
      height: '5px', width: '75px', background: '#6dfd00', margin: 'auto',
    }} />
  </Box>);

  const renderWaitScreen = () => (<Box sx={{
    height: '220px', width: '115px', borderRadius: '5px', padding: '10px', background: 'black',
  }}>
    <Typography variant="waitStopText" color="red">WAIT</Typography>
  </Box>);

  const renderStandbyScreen = () => (<Box
    sx={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '220px',
      width: '115px',
      borderRadius: '5px',
      padding: '10px 0',
      backgroundColor: 'black',
    }}
  >
    <Typography variant="standby" color="#fba401">
      {airportCode ? airportCodeValue : standName}
    </Typography>
    <Typography variant="standbyDate" color="#fba401">{fullDate}</Typography>
    <Typography variant="standbyDate" color="#fba401">{fullTime}</Typography>
  </Box>);

  return (<>
    {standbyScreen && renderStandbyScreen()}
    {waitScreen && renderWaitScreen()}
    {idFailScreen && renderIdFailScreen()}
    {dockingScreen && renderDockingScreen()}
    {stopScreen && renderStopScreen()}
    {tooFarScreen && renderTooFarScreen()}
    {okScreen && renderOkScreen()}
    {parkedScreen && renderParkedScreen()}
    {billingScreen && renderBillingScreen()}
    {errorScreen && renderErrorScreen()}
    {disconnectScreen && renderDisconnectScreen()}
  </>);
};

Rids.propTypes = {
  ridsDevice: PropTypes.any,
};

export default Rids;
