import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const savedAdmin = localStorage.getItem("admin"); 
  const token = localStorage.getItem("token");

  if (!savedAdmin || !token) {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
};
export default AdminProtectedRoute;