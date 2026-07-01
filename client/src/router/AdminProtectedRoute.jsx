import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated");

  if (isAuthenticated !== "true") {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />
};
export default AdminProtectedRoute;