import { Helmet } from 'react-helmet-async';

import { PermissionDeniedView } from '../sections/permission-denied';

// ----------------------------------------------------------------------

export default function PermissionDeniedPage() {
  return (
    <>
      <Helmet>
        <title> Permission Denied </title>
      </Helmet>

      <PermissionDeniedView />
    </>
  );
}
