import { Helmet } from 'react-helmet-async';

import { MultiCameraView } from '../sections/multi-camera';

// ----------------------------------------------------------------------

export default function CameraPage() {
  return (
    <>
      <Helmet>
        <title> Camera | GOS </title>
      </Helmet>

      <MultiCameraView />
    </>
  );
}
