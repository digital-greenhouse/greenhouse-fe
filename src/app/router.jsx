import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from '../features/auth/login/LoginPage';
import DashboardPage from '../features/dashboard/user/DashboardPage';
import ReservarPage from '../features/dashboard/user/ReservarPage';
import DashboardAdminMenu from '../features/dashboard/admin/DashboardAdminMenu';

function AppRoutes({ location, includeLoginRoute }) {
  return (
    <Routes location={location}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/reservar" element={<ReservarPage />} />
      <Route path="/admin" element={<DashboardAdminMenu />} />
      {includeLoginRoute && <Route path="/login" element={<LoginPage />} />}
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<h2>404 Not Found</h2>} />
    </Routes>
  );
}


function AppRouter() {
  const location = useLocation();
  const hasAuthToken = Boolean(localStorage.getItem('authToken'));

  if (hasAuthToken && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  const backgroundLocation = location.state?.backgroundLocation;
  const showLoginModal = location.pathname === '/login';
  const appLocation = showLoginModal
    ? backgroundLocation || {
        ...location,
        pathname: '/dashboard',
        search: '',
        hash: '',
        state: null,
        key: `${location.key}-background`,
      }
    : location;

  return (
    <>
      <AppRoutes location={appLocation} includeLoginRoute={!showLoginModal} />

      {showLoginModal && (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      )}
    </>
  );
}


export default AppRouter;