import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover'; 
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Rids from './rids';
import CameraView from './camera';
import { socket } from '../../websocket/websocket';
import StandStatusLayoutCard from './stand-status-layout';
import { useResponsive } from '../../hooks/use-responsive';
import Scrollbar from '../../components/scrollbar/scrollbar';
import { STAND } from '../../layouts/dashboard/config-layout';

// ----------------------------------------------------------------------

export default function StandInfo({ openStandInfo, onCloseStandInfo }) {
  const upLg = useResponsive('up', 'lg');

  const [stand, setStand] = useState('');

  const [multiStands, setMultiStands] = useState([]);

  const userId = JSON.parse(sessionStorage.getItem('userData')).userId.toString();

  useEffect(() => {
    if (!stand && multiStands.length === 0) {
      socket.emit('send-view-reload', userId);
    }
  }, [stand, multiStands, userId]);

  useEffect(() => {
    if (openStandInfo) {
      onCloseStandInfo();
    }
  }, [onCloseStandInfo, openStandInfo]);

  const setStandData = useCallback((newStand) => {
    setStand(() => newStand);
    setMultiStands(() => []);
  }, []);

  const setMultiStandsData = useCallback((newMultiStands) => {
    setStand(() => '');
    setMultiStands(() => newMultiStands);
  }, []);

  const handleSelectedStand = useCallback((data) => {
    if (userId === data.userId && data.stand.length > 0) {
      if (data.stand.length > 2) {
        setMultiStandsData(data.stand);
      } else {
        setStandData(data.stand[0])
      }
    }
  }, [setStandData, setMultiStandsData, userId]);

  useEffect(() => {
    socket.on('selectedStand', handleSelectedStand);

    // Clean up listeners
    return () => {
      socket.off('selectedStand', handleSelectedStand);
    };
  }, [handleSelectedStand]);

  const renderNoStandSelected = (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Typography variant="h5" color="textSecondary">
        Please select a stand.
      </Typography>
    </Box>);

  const renderSingleStandContent = (<Scrollbar
    sx={{
      height: 1, '& .simplebar-content': {
        height: 1, display: 'flex', flexDirection: 'column',
      },
    }}
  >
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2} mb={2}>
        <Typography variant="h3">Stand: {stand.standName}</Typography>
      </Stack>
      <Grid container mb={3} spacing={3}>
        <Grid item xs={12}>
          <StandStatusLayoutCard selectedGate={stand} />
        </Grid>
      </Grid>
      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2} mb={2}>
        <Typography variant="h4">RIDS</Typography>
      </Stack>
      <Grid container mb={3} spacing={3}>
        <Grid item xs={12}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 2, py: 2, borderRadius: 2, height: '250px', alignItems: 'center',
            }}
          >
            <Rids selectedGate={stand} />
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2} mb={2}>
        <Typography variant="h4">Camera</Typography>
      </Stack>
      <Grid container mb={2} spacing={3}>
        <Grid item xs={12}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 1, py: 1, borderRadius: 2, alignItems: 'center',
            }}
          >
            <CameraView selectedGate={stand} />
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ flexGrow: 1 }} />
    </Container>
  </Scrollbar>);

  const renderMultiStandContent = (<Scrollbar
    sx={{
      height: 1, '& .simplebar-content': {
        height: 1, display: 'flex', flexDirection: 'column',
      },
    }}
  >
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="center" mt={2} mb={2}>
        <Typography variant="h4">Stand</Typography>
      </Stack>
      <Grid container mb={3} spacing={2}>
        {multiStands.length > 1 && (<Grid item xs={4}>
          <Typography variant="h6" align="center">
            {multiStands[1].standName}
          </Typography>
          <StandStatusLayoutCard selectedGate={multiStands[1]} />
        </Grid>)}
        {multiStands.length > 0 && (<Grid item xs={4}>
          <Typography variant="h6" align="center">
            {multiStands[0].standName}
          </Typography>
          <StandStatusLayoutCard selectedGate={multiStands[0]} />
        </Grid>)}
        {multiStands.length > 2 && (<Grid item xs={4}>
          <Typography variant="h6" align="center">
            {multiStands[2].standName}
          </Typography>
          <StandStatusLayoutCard selectedGate={multiStands[2]} />
        </Grid>)}
      </Grid>
      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" alignItems="center" justifyContent="center" mt={2} mb={2}>
        <Typography variant="h5">RIDS</Typography>
      </Stack>
      <Grid container mb={3} spacing={1}>
        <Grid item xs={4}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 2, py: 2, borderRadius: 2, height: '250px', alignItems: 'center',
            }}
          >
            <Rids selectedGate={multiStands[1]} />
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 2, py: 2, borderRadius: 2, height: '250px', alignItems: 'center',
            }}
          >
            <Rids selectedGate={multiStands[0]} />
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 2, py: 2, borderRadius: 2, height: '250px', alignItems: 'center',
            }}
          >
            <Rids selectedGate={multiStands[2]} />
          </Card>
        </Grid>
      </Grid>
      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack direction="row" justifyContent="center" mt={2} mb={2}>
        <Typography variant="h5">Camera</Typography>
      </Stack>
      <Grid container mb={2} spacing={3}>
        <Grid item xs={12}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 1, py: 1, borderRadius: 2, alignItems: 'center',
            }}
          >
            <CameraView selectedGate={multiStands[1]} />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 1, py: 1, borderRadius: 2, alignItems: 'center',
            }}
          >
            <CameraView selectedGate={multiStands[0]} />
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card
            component={Stack}
            spacing={3}
            sx={{
              px: 1, py: 1, borderRadius: 2, alignItems: 'center',
            }}
          >
            <CameraView selectedGate={multiStands[2]} />
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ flexGrow: 1 }} />
    </Container>
  </Scrollbar>);

  const renderContent = () => {
    if (multiStands.length > 0) {
      return renderMultiStandContent;
    }
    if (stand) {
      return renderSingleStandContent;
    }
    return renderNoStandSelected;
  };

  return (<Box
    sx={{
      flexShrink: { lg: 0 }, width: { lg: STAND.WIDTH },
    }}
  >
    {upLg ? (<Box
      sx={{
        height: '91vh',
        position: 'fixed',
        width: STAND.WIDTH,
        borderLeft: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
    >
      {renderContent()}
    </Box>) : (<Popover
      open={openStandInfo}
      onClose={onCloseStandInfo}
      PaperProps={{
        sx: {
          width: STAND.WIDTH,
        },
      }}
    >
      {renderContent()}
    </Popover>)}
  </Box>);
}

StandInfo.propTypes = {
  openStandInfo: PropTypes.bool, onCloseStandInfo: PropTypes.func,
};