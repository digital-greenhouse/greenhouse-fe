import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoginPage from '../features/auth/login/LoginPage';
import DashboardPage from '../features/dashboard/user/DashboardPage';
import ReservarPage from '../features/dashboard/user/ReservarPage';
import DashboardAdminMenu from '../features/dashboard/admin/DashboardAdminMenu';
import BokingMenu from '../features/booking/BookingMenu';
import HistoryBokings from '../features/dashboard/admin/HistoryBookings/HistoryBokings';
import Reports from '../features/dashboard/admin/Reports/Reports';
import PropertiesNav from '../features/dashboard/properties/propertiesNav/PropertiesNav';
import NewProperty from '../features/dashboard/properties/newProperty/NewProperty';
import HistoryProperties from '../features/dashboard/admin/historyProperties/HistroryProperties';
import Users from '../features/dashboard/admin/users/Users';

function AppRoutes({ location, includeLoginRoute }) {
  return (

    <Routes location={location}>
      <Route path="/dashboard" element={<DashboardPage />}>
        <Route path="booking-actual" element={<BokingMenu />} />
      </Route>
      <Route path="/reservar" element={<ReservarPage />} />
      <Route path="admin" element={<DashboardAdminMenu />}>
        <Route path="history-bookings" element={<HistoryBokings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="history-properties" element={<HistoryProperties />} />
        <Route path="users" element={<Users />} />
      </Route>
      {includeLoginRoute && <Route path="/login" element={<LoginPage />} />}
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<h2>404 Not Found</h2>} />
      <Route path="/properties" element={<PropertiesNav />} >
        <Route path="reservas" element={<BokingMenu />} />
        <Route path="new" element={<NewProperty />} />  
      </Route>
    </Routes>

  );
}

AppRoutes.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    hash: PropTypes.string,
    key: PropTypes.string,
    state: PropTypes.any,
  }),
  includeLoginRoute: PropTypes.bool,
};


function AppRouter() {
  const location = useLocation();
  const hasAuthToken = Boolean(localStorage.getItem('authToken'));

  if (!hasAuthToken && location.pathname === '/reservar') {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectTo: '/reservar',
          backgroundLocation: {
            ...location,
            pathname: '/dashboard',
            search: '',
            hash: '',
            state: null,
          },
        }}
      />
    );
  }

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