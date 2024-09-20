import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import StandInfo from '../stand-info';
import { useResponsive } from '../../../hooks/use-responsive';
import KolkataAirportLayoutCard from '../kolkata-airport-layout';
import { STAND } from '../../../layouts/dashboard/config-layout';
// import AmritsarAirportLayoutCard from '../amritsar-airport-layout';

// ----------------------------------------------------------------------

export default function AppView() {

  const [openStandInfo, setOpenStandInfo] = useState(false);

  const upLg = useResponsive('up', 'lg');

  return (<Box
    sx={{ 
      display: 'flex', 
      height: '100%',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: upLg ? `calc(100% - ${STAND.WIDTH}px)` : '100%', padding: 3.5, }}>
      <Grid spacing={3}>
        <Grid item xs={12}>
          <KolkataAirportLayoutCard onOpenStandInfo={() => setOpenStandInfo(true)} />
        </Grid>
      </Grid>
    </Box>
    <StandInfo openStandInfo={openStandInfo} onCloseStandInfo={() => setOpenStandInfo(false)} />
  </Box>);
}





