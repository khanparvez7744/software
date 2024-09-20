import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import Logo from '../../components/logo';
import { SERVER_IP } from '../../../config';
import { bgGradient } from '../../theme/css';

// ----------------------------------------------------------------------

export default function SignupView() {
  const theme = useTheme();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [inputs, setInputs] = useState({ username: '', password: '', cPassword:'' });

  const { enqueueSnackbar } = useSnackbar();

  const handleInputChange = (name) => (event) => {
    setInputs({
      ...inputs, [name]: event.target.value,
    });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${SERVER_IP}/api/users/signup`, {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify(inputs),
      });

      if (response.ok) {
        const data = await response.json();
        enqueueSnackbar(data.message, {
          variant: 'success', anchorOrigin: {
            vertical: 'top', horizontal: 'right',
          }, autoHideDuration: 3000,
        });
        navigate('/', { replace: true });
      } else {
        const data = await response.json();
        console.log(data.error);
        enqueueSnackbar(data.error, {
          variant: 'warning', anchorOrigin: {
            vertical: 'top', horizontal: 'right',
          }, autoHideDuration: 3000,
        });
      }
    } catch (error) {
      enqueueSnackbar('Error during signup.', {
        variant: 'error', anchorOrigin: {
          vertical: 'top', horizontal: 'right',
        }, autoHideDuration: 3000,
      });
    }
  };

  const isEmailValid = (email) => {
    if (!email) {
      return true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const renderForm = (<>
      <Stack spacing={3}>
        <TextField
          name="name"
          label="Name"
          value={inputs.name}
          onChange={handleInputChange('name')}
          inputProps={{
            maxLength: 25,
          }}
          required
        />
        <TextField
          name="email"
          label="Email"
          value={inputs.email}
          onChange={handleInputChange('email')}
          inputProps={{
            maxLength: 50,
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', // Pattern attribute for supporting browsers
          }}
          error={!isEmailValid(inputs.email)}
          helperText={!isEmailValid(inputs.email) ? 'Invalid email format' : ''}
          required
        />
        <TextField
          name="username"
          label="Username"
          value={inputs.username}
          onChange={handleInputChange('username')}
          inputProps={{
            maxLength: 20,
          }}
          required
        />
        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={inputs.password}
          onChange={handleInputChange('password')}
          InputProps={{
            endAdornment: (<InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? (<VisibilityIcon />) : (<VisibilityOffIcon />) }
              </IconButton>
            </InputAdornment>),
          }}
          required
        />
        <TextField
          name="cPassword"
          label="Confirm Password"
          type={showCPassword ? 'text' : 'password'}
          value={inputs.cPassword}
          onChange={handleInputChange('cPassword')}
          InputProps={{
            endAdornment: (<InputAdornment position="end">
              <IconButton onClick={() => setShowCPassword(!showCPassword)} edge="end">
                {showCPassword ? (<VisibilityIcon />) : (<VisibilityOffIcon />) }
              </IconButton>
            </InputAdornment>),
          }}
          required
        />
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        onClick={handleSignUp}
        sx={{ my: 3 }}
      >
        Create Account
      </LoadingButton>
    </>);

  return (
      <Box
        sx={{
          ...bgGradient({
            color: alpha(theme.palette.background.default, 0.95), imgUrl: './assets/background/overlay_4.jpg',
          }), height: 1,
        }}
      >

        <Logo
          sx={{
            position: 'fixed', top: { xs: 16, md: 24 }, left: { xs: 16, md: 24 },
          }}
        />
        <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
          <Card
            sx={{
              p: 5, width: 1, maxWidth: 420,
            }}
          >
            <Typography variant="h4">Get started | GOS</Typography>

            <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
              Already have an account?
              <Link color="inherit" variant="subtitle2" sx={{ ml: 0.5 }} href="/auth/login">
                  Sign in
              </Link>
            </Typography>
            {renderForm}
            <Typography variant="caption" color="inherit">By signing up, I agree to Terms of Service and Privacy Policy.</Typography>
          </Card>
        </Stack>
      </Box>
  );
}
