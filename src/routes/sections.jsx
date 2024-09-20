import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from '../layouts/dashboard';
import { useAuth } from '../auth-context/auth-context';

export const IndexPage = lazy(() => import('../pages/app'));
export const SetupPage = lazy(() => import('../pages/setup'));
export const CameraPage = lazy(() => import('../pages/camera'));
export const RidsPage = lazy(() => import('../pages/rids')); 
export const LoginPage = lazy(() => import('../pages/login'));
export const SignupPage = lazy(() => import('../pages/signup'));
export const Page404 = lazy(() => import('../pages/page-not-found'));
export const Page403 = lazy(() => import('../pages/permission-denied'));

// ----------------------------------------------------------------------

export default function Router() {

  const PrivateRoute = ({ element, path }) => {
    const { user, config } = useAuth();

    if (!config) {
      return <Navigate to="/setup" replace />;
    }

    if (user) {
      const userRole = user.role;

      if (userRole) {
        return element;
      }
      return <Navigate to="/403" replace />;
    }

    return <Navigate to="/auth/login" replace />;
  };

  PrivateRoute.propTypes = {
    element: PropTypes.node.isRequired, path: PropTypes.string.isRequired,
  };

  return useRoutes([{
    path: '/', element: <Navigate to="/auth/login" replace />,
  }, {
    element: (<DashboardLayout>
      <Suspense>
        <Outlet />
      </Suspense>
    </DashboardLayout>), children: [{
      path: 'dashboard',
      element: <PrivateRoute element={<IndexPage />} path="dashboard" />,
      index: true,
    }, {
      path: 'camera',
      element: <PrivateRoute element={<CameraPage />} path="camera" />,
    }, {
      path: 'rids',
      element: <PrivateRoute element={<RidsPage />} path="rids" />,
    },],
  }, {
    path: 'auth/login', element: <LoginPage />,
  }, {
    path: 'auth/admin/signup', element: <SignupPage />,
  }, {
    path: 'setup', element: <SetupPage />,
  }, {
    path: '403', element: <Page403 />,
  }, {
    path: '404', element: <Page404 />,
  }, {
    path: '*', element: <Navigate to="/404" replace />,
  }]);
}
