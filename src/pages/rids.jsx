import { Helmet } from 'react-helmet-async';

import { MultiRidsView } from '../sections/multi-rids';

// ----------------------------------------------------------------------

export default function RidsPage() {
  return (
    <>
      <Helmet>
        <title> RIDS | GOS </title>
      </Helmet>

      <MultiRidsView />
    </>
  );
}
