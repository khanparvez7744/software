import { Helmet } from 'react-helmet-async';
import { SnackbarProvider } from 'notistack';

import { SignupView } from '../sections/signup';

// ----------------------------------------------------------------------

export default function SignupPage() {
  return (<>
      <Helmet>
        <title> Get started | GOS </title>
      </Helmet>
      <SnackbarProvider maxSnack={3}>
        <SignupView />
      </SnackbarProvider>
    </>);
}
