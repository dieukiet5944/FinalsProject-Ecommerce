import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated");

  if (isAuthenticated !== "true") {
    return <Navigate to="/admin-login" replace />;
  }

  return children
};
export default AdminProtectedRoute;