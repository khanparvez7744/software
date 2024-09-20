import lottie from 'lottie-web';
import React, { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import Stands from '../stands';
import AOCCSetup from '../aocc-setup';
import animationData from './hello.json';
import Logo from '../../../components/logo';
import ApplicationSettings from '../application-setup';

// ----------------------------------------------------------------------

export default function SystemSetupPage() {

  const [showHello, setShowHello] = useState(true);
  const [showApplicationSetup, setShowApplicationSetup] = useState(false);
  const [showAOCCSetup, setShowAOCCSetup] = useState(false);
  const [showStandSetup, setShowStandSetup] = useState(false);

  useEffect(() => {
    if (showHello) {
      lottie.loadAnimation({
        container: document.getElementById('setup-hello'), // Replace with your container ID
        renderer: 'svg', loop: true, autoplay: true, animationData, // Animation data imported from JSON file
      });
    }
  }, [showHello]);

  const handleHelloNextClick = () => {
    setShowHello(false);
    setShowApplicationSetup(true);
  };

  const handleApplicationNextClick = () => {
    setShowApplicationSetup(false);
    setShowAOCCSetup(true);
  };

  const handleAOCCNextClick = () => {
    setShowAOCCSetup(false);
    setShowStandSetup(true);
  };

  const renderHello = (<Grid sx={{
      display: 'flex', justifyContent: 'space-between', p: (theme) => theme.spacing(3, 3, 3, 3),
    }} container spacing={3} alignItems="center" justifyContent="space-between">
      <Grid id="setup-hello" sx={{ height: 500 }} item xs={12} />
      <Grid item xs={12}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
          <IconButton aria-label="next" size="large" onClick={handleHelloNextClick}>
            <ArrowForwardIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </Grid>
    </Grid>);

  return (<Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
      <Logo
        sx={{
          position: 'fixed', top: { xs: 16, md: 24 }, left: { xs: 16, md: 24 },
        }}
      />
      <Container>
        <Stack alignItems="center" mb={5}>
          <Typography variant="h4">Application Setup</Typography>
        </Stack>
        <Card sx={{ backgroundColor: '#454f5b7a'}}>
          {showHello && renderHello}
          {showApplicationSetup && <ApplicationSettings onNext={handleApplicationNextClick} />}
          {showAOCCSetup && <AOCCSetup onNext={handleAOCCNextClick} />}
          {showStandSetup && <Stands />}
        </Card>
      </Container>
    </Stack>);
}

SystemSetupPage.propTypes = {};