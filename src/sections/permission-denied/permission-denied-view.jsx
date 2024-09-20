import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Logo from '../../components/logo';
import { RouterLink } from '../../routes/components';

// ----------------------------------------------------------------------

export default function PermissionDeniedView() {
  const navigate = useNavigate();

  const renderHeader = (
    <Box
      component="header"
      sx={{
        top: 0,
        left: 0,
        width: 1,
        lineHeight: 0,
        position: 'fixed',
        p: (theme) => ({ xs: theme.spacing(3, 3, 0), sm: theme.spacing(5, 5, 0) }),
      }}
    >
      <Logo />
    </Box>
  );

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      {renderHeader}

      <Container>
        <Box
          sx={{
            py: 12,
            maxWidth: 480,
            mx: 'auto',
            display: 'flex',
            minHeight: '100vh',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ mb: 3 }}>
            Permission Denied!
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Sorry, You do not have permission to access this page.
          </Typography>

          <Box
            component="img"
            src="./assets/illustrations/illustration_403.svg"
            sx={{
              mx: 'auto',
              height: 360,
              my: { xs: 5, sm: 10 },
            }}
          />

          <Button onClick={handleBack} size="large" color="inherit" variant="contained" component={RouterLink}>
            Go Back
          </Button>
        </Box>
      </Container>
    </>
  );
}
