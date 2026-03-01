import { Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';



function AppRouter() {

  console.log('AppRouter renderizado');
  return (
    <Routes>
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