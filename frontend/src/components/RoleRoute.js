import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RoleRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('access');
  if (!token) return <Navigate to="/login" />;
  const decoded = jwtDecode(token);
  const role = decoded.role;
  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} />;
  }
  return <Outlet />;
};

export default RoleRoute;