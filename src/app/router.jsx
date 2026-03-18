import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import LoginPage from '../features/auth/login/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ReservarPage from '../features/dashboard/ReservarPage';

function AppRoutes({ location, includeLoginRoute }) {
  return (
    <Routes location={location}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/reservar" element={<ReservarPage />} />
      {includeLoginRoute && <Route path="/login" element={<LoginPage />} />}
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<h2>404 Not Found</h2>} />
    </Routes>
  );
}


function AppRouter() {
  const location = useLocation();
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