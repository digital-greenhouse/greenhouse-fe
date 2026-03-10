import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';



function AppRouter() {

  console.log('AppRouter renderizado');
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 
      {localStorage.getItem('authToken') ?
        <Route index element={<Navigate to="admin/home/summary" />} /> :
        <Route index element={<Navigate to="/login" />} />
      } */}
      {/* <Route index element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/admin/home" />} /> */}
      {/*  */}
      <Route path="*" element={<h2>404 Not Found</h2>} />
    </Routes>
  );
}


export default AppRouter;