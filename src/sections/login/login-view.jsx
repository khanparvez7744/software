import { toast } from 'sonner'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
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
import { useAuth } from '../../auth-context/auth-context';


// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();

  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [isLoginLoading, setLoginLoading] = useState(false);

  const [inputs, setInputs] = useState({ userInput: '', password: '' });

  const handleInputChange = (name) => (event) => {
    setInputs({
      ...inputs,
      [name]: event.target.value,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoginLoading(true);
      const response = await fetch(`${SERVER_IP}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (response.ok) {
        const data = await response.json();
        const {user} = data;
        const {config} = data;
        const tabId = Math.random().toString(36).substr(2,9);
        login(user, config, tabId);
        navigate('/dashboard', { replace: true });
        toast.success(data.message);
      } else {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error during login:', error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const renderForm = (
    <>
      <Stack spacing={3} sx={{ mb: 4 }}>
        <TextField
          name="username"
          label="Username"
          value={inputs.userInput}
          onChange={handleInputChange('userInput')}
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
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? (<VisibilityIcon />) : (<VisibilityOffIcon />)}
                </IconButton>
              </InputAdornment>
            ),
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
        onClick={handleLogin}
        loading={isLoginLoading}
      >
        Login
      </LoadingButton>
    </>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.95),
          imgUrl: '../../assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography sx={{ mb: 3 }} variant="h4">Sign in to GOS</Typography>

          {renderForm}
        </Card>
      </Stack>
    </Box>
  );
}
