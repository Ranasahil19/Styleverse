import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// Lazy load authentication components
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />, // ✅ MinimalLayout for public auth pages
  children: [
    { path: 'login', element: <AuthLogin3 /> },
    { path: 'register', element: <AuthRegister3 /> }
  ]
};

export default AuthenticationRoutes;
