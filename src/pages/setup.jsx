import { Helmet } from 'react-helmet-async';

import { SystemSetupView } from '../sections/system-setup/view';

// ----------------------------------------------------------------------

export default function UserFormPage() {
  return (
    <>
      <Helmet>
        <title> Setup | GOS </title>
      </Helmet>

      <SystemSetupView />
    </>
  );
}
