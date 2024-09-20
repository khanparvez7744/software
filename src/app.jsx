import { Toaster } from 'sonner';

import './global.css';
import ThemeProvider from './theme';
import Router from './routes/sections';
import { useScrollToTop } from './hooks/use-scroll-to-top';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <ThemeProvider>
      <Toaster richColors position="bottom-right" expand={false} />
      <Router />
    </ThemeProvider>
  );
}
