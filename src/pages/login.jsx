import { Helmet } from 'react-helmet-async';
import { SnackbarProvider } from 'notistack';

import { LoginView } from '../sections/login';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Login | GOS </title>
      </Helmet>
      <SnackbarProvider maxSnack={3}>
        <LoginView />
      </SnackbarProvider>
    </>
  );
}
